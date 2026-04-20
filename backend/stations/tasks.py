from celery import shared_task
from django.utils import timezone
from django.core.cache import cache
from datetime import datetime, timezone as dt_timezone

from .bootstrap import window_service


def _local_hour(utc_aware_dt) -> str:
    return timezone.localtime(utc_aware_dt).strftime("%H:%M")

PRE_OPEN_MINUTES = 15
CLOSING_SOON_MINUTES = 3


def _notif_sent(key: str) -> bool:
    return bool(cache.get(key))


def _mark_notif_sent(key: str):
    cache.set(key, True, timeout=7200)


@shared_task
def check_window_transition():
    from notifications.tasks import deliver_notification

    now = timezone.now()
    current = window_service.current(now)

    # 1. Pre-open reminder: 15 min before window opens
    if not current:
        nxt = window_service.next(now)
        opens_in = nxt.opens_in(now)
        if 0 < opens_in <= PRE_OPEN_MINUTES * 60:
            key = f"notif_pre_open_{nxt.hour}_{nxt.opens_at.date()}"
            if not _notif_sent(key):
                _mark_notif_sent(key)
                deliver_notification.delay(
                    title="⏰ Скоро откроется окно",
                    body=f"Через {opens_in // 60} мин откроется окно {_local_hour(nxt.opens_at)}. Подготовьте данные SYNOP.",
                    level="info",
                    data={"type": "window_pre_open", "hour": str(nxt.hour)},
                )

    if current:
        date_str = str(current.opens_at.date())

        # 2. Window opened notification
        key_opened = f"notif_opened_{current.hour}_{date_str}"
        if not _notif_sent(key_opened):
            _mark_notif_sent(key_opened)
            deliver_notification.delay(
                title="📡 Окно подачи данных открыто",
                body=f"Окно {_local_hour(current.opens_at)} открыто. Отправьте данные SYNOP.",
                level="info",
                data={"type": "window_opened", "hour": str(current.hour)},
            )

        # 3. Closing soon: 3 min left
        seconds_left = current.seconds_left(now)
        if 0 < seconds_left <= CLOSING_SOON_MINUTES * 60:
            key_closing = f"notif_closing_{current.hour}_{date_str}"
            if not _notif_sent(key_closing):
                _mark_notif_sent(key_closing)
                deliver_notification.delay(
                    title="⚠️ Осталось 3 минуты!",
                    body=f"Окно {_local_hour(current.opens_at)} закрывается через {seconds_left // 60} мин. Поторопитесь!",
                    level="warning",
                    data={"type": "window_closing_soon", "hour": str(current.hour)},
                )

    # 4. Window closed: detect open→closed transition
    was_open = cache.get("window_was_open_v2", False)
    last_open_hour = cache.get("window_last_open_hour")
    last_open_date = cache.get("window_last_open_date")

    if current:
        cache.set("window_was_open_v2", True, timeout=300)
        cache.set("window_last_open_hour", current.hour, timeout=300)
        cache.set("window_last_open_date", str(current.opens_at.date()), timeout=300)
    else:
        cache.set("window_was_open_v2", False, timeout=300)
        if was_open and last_open_hour is not None and last_open_date is not None:
            key_closed = f"notif_closed_{last_open_hour}_{last_open_date}"
            if not _notif_sent(key_closed):
                _mark_notif_sent(key_closed)
                local_closed = _local_hour(
                    datetime(
                        *[int(p) for p in last_open_date.split("-")],
                        last_open_hour, tzinfo=dt_timezone.utc
                    )
                )
                deliver_notification.delay(
                    title="🔒 Окно закрыто",
                    body=f"Окно {local_closed} закрыто. Следующее откроется скоро.",
                    level="info",
                    data={"type": "window_closed", "hour": str(last_open_hour)},
                )
                notify_overdue_stations.apply_async(
                    args=[last_open_hour, last_open_date], countdown=120
                )


@shared_task
def notify_overdue_stations(window_hour: int, window_date_str: str):
    from notifications.tasks import deliver_notification
    from .models import Station, DataSubmission
    from datetime import date

    window_date = date.fromisoformat(window_date_str)
    base = datetime(window_date.year, window_date.month, window_date.day, window_hour, tzinfo=dt_timezone.utc)
    opens_at = base + window_service.open_offset
    closes_at = base + window_service.close_offset

    for station in Station.objects.filter(is_active=True):
        submitted = DataSubmission.objects.filter(
            station=station,
            window_hour=window_hour,
            timestamp__gte=opens_at,
            timestamp__lte=closes_at,
        ).exists()

        if not submitted:
            key = f"notif_overdue_{station.station_id}_{window_hour}_{window_date_str}"
            if not _notif_sent(key):
                cache.set(key, True, timeout=86400)
                deliver_notification.delay(
                    title="❌ Данные не поданы",
                    body=f"{station.name} ({station.station_id}) не отправила данные в окне {_local_hour(opens_at)}.",
                    level="warning",
                    data={"type": "station_overdue", "station_id": station.station_id},
                )
