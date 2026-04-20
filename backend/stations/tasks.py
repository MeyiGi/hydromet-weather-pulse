from celery import shared_task
from django.utils import timezone
from django.core.cache import cache

from .bootstrap import window_service

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
                    body=f"Через {opens_in // 60} мин откроется окно {nxt.hour:02d}:00 UTC. Подготовьте данные SYNOP.",
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
                body=f"Окно {current.hour:02d}:00 UTC открыто. Отправьте данные SYNOP.",
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
                    body=f"Окно {current.hour:02d}:00 UTC закрывается через {seconds_left // 60} мин. Поторопитесь!",
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
                deliver_notification.delay(
                    title="🔒 Окно закрыто",
                    body=f"Окно {last_open_hour:02d}:00 UTC закрыто. Следующее откроется скоро.",
                    level="info",
                    data={"type": "window_closed", "hour": str(last_open_hour)},
                )
