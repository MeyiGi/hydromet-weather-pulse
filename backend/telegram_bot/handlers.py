from django.utils import timezone

from .bot import send_message, answer_callback, edit_message_text, MAIN_KEYBOARD
from .models import TelegramChat, StationSubscription

HELP_TEXT = (
    "<b>HydroMet Weather Pulse</b>\n\n"
    "Используйте кнопки меню внизу или команды:\n\n"
    "/status — сводка по всем станциям\n"
    "/overdue — просроченные станции\n"
    "/window — текущее окно SYNOP\n"
    "/today — отчёт за сегодня\n"
    "/stats — статистика за 7 дней\n"
    "/subscriptions — мои подписки\n"
    "/setlevel — фильтр уровня уведомлений\n"
    "/subscribe — подписаться на станцию\n"
    "/unsubscribe — отписаться\n\n"
    "<b>Уровни уведомлений:</b>\n"
    "• <code>info</code> — все (по умолчанию)\n"
    "• <code>warning</code> — WARNING + ERROR\n"
    "• <code>error</code> — только ERROR"
)


def _get_or_create_chat(message: dict) -> TelegramChat:
    chat_id = message["chat"]["id"]
    username = message.get("from", {}).get("username", "")
    chat, _ = TelegramChat.objects.get_or_create(
        chat_id=chat_id, defaults={"username": username, "is_active": True}
    )
    if not chat.is_active:
        chat.is_active = True
        chat.save(update_fields=["is_active"])
    return chat


# ── Reply handlers ────────────────────────────────────────────────────────────

def handle_start(message: dict):
    chat = _get_or_create_chat(message)
    send_message(
        chat.chat_id,
        "Добро пожаловать! 👋\n\nВы подключены к системе мониторинга метеостанций.",
        reply_markup=MAIN_KEYBOARD,
    )


def handle_help(message: dict):
    chat = _get_or_create_chat(message)
    send_message(chat.chat_id, HELP_TEXT, reply_markup=MAIN_KEYBOARD)


def handle_status(message: dict):
    chat = _get_or_create_chat(message)

    from stations.models import Station

    stations = list(Station.objects.filter(is_active=True))
    counts = {"on_time": 0, "pending": 0, "overdue": 0}
    for s in stations:
        key = s.submission_status()
        counts[key] = counts.get(key, 0) + 1

    inactive = Station.objects.filter(is_active=False).count()
    now = timezone.now()
    now_local = timezone.localtime(now)

    text = (
        f"<b>📊 Статус станций</b> — {now_local.strftime('%H:%M')}\n\n"
        f"✅ Вовремя:    <b>{counts['on_time']}</b>\n"
        f"⏳ Ожидание:  <b>{counts['pending']}</b>\n"
        f"❌ Просрочено: <b>{counts['overdue']}</b>\n"
        f"⚫ Неактивных: <b>{inactive}</b>\n\n"
        f"Всего активных: {len(stations)}"
    )
    send_message(chat.chat_id, text)


def handle_overdue(message: dict):
    chat = _get_or_create_chat(message)

    from stations.models import Station

    overdue = [s for s in Station.objects.filter(is_active=True) if s.submission_status() == "overdue"]

    if not overdue:
        send_message(chat.chat_id, "✅ Просроченных станций нет!")
        return

    lines = [f"<b>❌ Просроченные станции ({len(overdue)})</b>\n"]
    for s in overdue:
        if s.last_seen:
            delta = timezone.now() - s.last_seen
            total_h = int(delta.total_seconds() // 3600)
            m = int((delta.total_seconds() % 3600) // 60)
            if total_h >= 48:
                ago = f"{total_h // 24}д назад"
            elif total_h >= 24:
                ago = f"1д {total_h % 24}ч назад"
            elif total_h:
                ago = f"{total_h}ч {m}м назад"
            else:
                ago = f"{m}м назад"
        else:
            ago = "никогда"
        lines.append(f"• <b>{s.name}</b> (<code>{s.station_id}</code>) — {ago}")

    send_message(chat.chat_id, "\n".join(lines))


def handle_subscriptions(message: dict):
    chat = _get_or_create_chat(message)
    subs = list(chat.subscriptions.select_related("station").all())
    level_label = chat.get_notification_level_display()

    if not subs:
        text = (
            f"📋 <b>Мои подписки</b>\n\n"
            f"Подписок нет — получаете <b>все</b> уведомления.\n"
            f"Уровень: <b>{level_label}</b>"
        )
    else:
        lines = [f"📋 <b>Мои подписки</b> (уровень: <b>{level_label}</b>)\n"]
        for sub in subs:
            if sub.station is None:
                lines.append("• 🌍 Все станции")
            else:
                lines.append(f"• <b>{sub.station.name}</b> (<code>{sub.station.station_id}</code>)")
        text = "\n".join(lines)

    send_message(chat.chat_id, text)


def handle_window(message: dict):
    chat = _get_or_create_chat(message)
    from stations.bootstrap import window_service

    now = timezone.now()
    current = window_service.current(now)

    if current:
        left = current.seconds_left(now)
        m, s = divmod(left, 60)
        opens_local = timezone.localtime(current.opens_at)
        closes_local = timezone.localtime(current.closes_at)
        text = (
            f"<b>🟢 Окно открыто</b> — {opens_local.strftime('%H:%M')}\n\n"
            f"Закрывается через: <b>{m} мин {s} сек</b>\n"
            f"Период: {opens_local.strftime('%H:%M')} – {closes_local.strftime('%H:%M')}"
        )
    else:
        nxt = window_service.next(now)
        opens_in = nxt.opens_in(now)
        h_part, rem = divmod(opens_in, 3600)
        m_part = rem // 60
        time_str = f"{h_part}ч {m_part}м" if h_part else f"{m_part} мин"
        nxt_local = timezone.localtime(nxt.opens_at)
        text = (
            f"<b>🔒 Окно закрыто</b>\n\n"
            f"Следующее окно: <b>{nxt_local.strftime('%H:%M')}</b>\n"
            f"Откроется через: <b>{time_str}</b>"
        )

    send_message(chat.chat_id, text)


def handle_today(message: dict):
    chat = _get_or_create_chat(message)
    from stations.models import Station, DataSubmission
    from stations.bootstrap import window_service

    now = timezone.now()
    today = timezone.localtime(now).date()

    closed_windows = [
        w for w in window_service._iter_windows(today)
        if timezone.localtime(w.opens_at).date() == today and w.closes_at < now
    ]

    if not closed_windows:
        send_message(chat.chat_id, "📅 Сегодня ещё не было закрытых окон.")
        return

    stations = list(Station.objects.filter(is_active=True).order_by("name"))
    from_dt = min(w.opens_at for w in closed_windows)
    to_dt = max(w.closes_at for w in closed_windows)

    subs = set(
        DataSubmission.objects.filter(
            timestamp__gte=from_dt,
            timestamp__lte=to_dt,
        ).values_list("station_id", "window_hour")
    )

    total_expected = len(stations) * len(closed_windows)
    total_submitted = 0
    lines = [f"<b>📅 Отчёт за сегодня</b> ({today.strftime('%d.%m.%Y')})\n"]
    lines.append(f"Закрытых окон: {len(closed_windows)}\n")

    for station in stations:
        count = sum(1 for w in closed_windows if (station.id, w.hour) in subs)
        total_submitted += count
        icon = "✅" if count == len(closed_windows) else ("⚠️" if count > 0 else "❌")
        lines.append(f"{icon} <b>{station.name}</b>: {count}/{len(closed_windows)}")

    pct = int(100 * total_submitted / total_expected) if total_expected else 0
    lines.append(f"\n<b>Итого: {total_submitted}/{total_expected} ({pct}%)</b>")
    send_message(chat.chat_id, "\n".join(lines))


def handle_stats(message: dict):
    chat = _get_or_create_chat(message)
    from stations.models import Station, DataSubmission
    from stations.bootstrap import window_service
    from django.db.models.functions import TruncDate
    import datetime as dt

    now = timezone.now()
    week_start = now - dt.timedelta(days=7)
    stations = list(Station.objects.filter(is_active=True).order_by("name"))
    total_expected = 7 * len(window_service.hours)

    lines = [f"<b>📈 Статистика за 7 дней</b>\n"]

    for station in stations:
        count = (
            DataSubmission.objects
            .filter(station=station, timestamp__gte=week_start)
            .annotate(day=TruncDate("timestamp"))
            .values("day", "window_hour")
            .distinct()
            .count()
        )
        pct = min(100, int(100 * count / total_expected)) if total_expected else 0
        filled = pct // 10
        bar = "█" * filled + "░" * (10 - filled)
        lines.append(f"<b>{station.name}</b>  {bar} {pct}%")

    send_message(chat.chat_id, "\n".join(lines))


def handle_settings_menu(message: dict):
    chat = _get_or_create_chat(message)
    _send_settings_menu(chat)


def _send_settings_menu(chat: TelegramChat):
    level = chat.notification_level.upper()
    keyboard = {
        "inline_keyboard": [
            [
                {"text": f"🔔 Уровень: {level}", "callback_data": "menu:level"},
            ],
            [
                {"text": "➕ Подписаться на станцию", "callback_data": "menu:subscribe"},
                {"text": "➖ Отписаться", "callback_data": "menu:unsubscribe"},
            ],
            [
                {"text": "🌍 Подписаться на все", "callback_data": "sub:all"},
                {"text": "🗑 Сбросить все подписки", "callback_data": "unsub:all"},
            ],
        ]
    }
    send_message(chat.chat_id, "⚙️ <b>Настройки</b>", reply_markup=keyboard)


def _send_level_menu(chat_id: int, message_id: int):
    keyboard = {
        "inline_keyboard": [
            [
                {"text": "ℹ️ INFO — все", "callback_data": "setlevel:info"},
                {"text": "⚠️ WARNING+", "callback_data": "setlevel:warning"},
                {"text": "🔴 ERROR only", "callback_data": "setlevel:error"},
            ],
            [{"text": "← Назад", "callback_data": "menu:settings"}],
        ]
    }
    edit_message_text(chat_id, message_id, "🔔 <b>Выберите уровень уведомлений:</b>", reply_markup=keyboard)


def _send_subscribe_menu(chat_id: int, message_id: int):
    from stations.models import Station

    stations = list(Station.objects.filter(is_active=True).order_by("name")[:20])
    rows = []
    for s in stations:
        rows.append([{"text": f"📡 {s.name} ({s.station_id})", "callback_data": f"sub:{s.station_id}"}])
    rows.append([{"text": "← Назад", "callback_data": "menu:settings"}])
    keyboard = {"inline_keyboard": rows}
    edit_message_text(chat_id, message_id, "➕ <b>Выберите станцию для подписки:</b>", reply_markup=keyboard)


def _send_unsubscribe_menu(chat_id: int, message_id: int, chat: TelegramChat):
    subs = list(chat.subscriptions.select_related("station").all())
    if not subs:
        edit_message_text(chat_id, message_id, "ℹ️ У вас нет активных подписок.")
        return

    rows = []
    for sub in subs:
        if sub.station is None:
            rows.append([{"text": "🌍 Все станции", "callback_data": "unsub:all"}])
        else:
            rows.append([{"text": f"❌ {sub.station.name} ({sub.station.station_id})", "callback_data": f"unsub:{sub.station.station_id}"}])
    rows.append([{"text": "← Назад", "callback_data": "menu:settings"}])
    keyboard = {"inline_keyboard": rows}
    edit_message_text(chat_id, message_id, "➖ <b>Выберите подписку для удаления:</b>", reply_markup=keyboard)


# ── Callback query handler ────────────────────────────────────────────────────

def handle_callback_query(callback: dict):
    callback_id = callback["id"]
    data: str = callback.get("data", "")
    message = callback.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    message_id = message.get("message_id")

    try:
        chat = TelegramChat.objects.get(chat_id=chat_id)
    except TelegramChat.DoesNotExist:
        answer_callback(callback_id)
        return

    action, _, value = data.partition(":")

    if action == "menu":
        if value == "level":
            _send_level_menu(chat_id, message_id)
        elif value == "subscribe":
            _send_subscribe_menu(chat_id, message_id)
        elif value == "unsubscribe":
            _send_unsubscribe_menu(chat_id, message_id, chat)
        elif value == "settings":
            edit_message_text(chat_id, message_id, "⚙️ <b>Настройки</b>", reply_markup={
                "inline_keyboard": [
                    [{"text": f"🔔 Уровень: {chat.notification_level.upper()}", "callback_data": "menu:level"}],
                    [
                        {"text": "➕ Подписаться", "callback_data": "menu:subscribe"},
                        {"text": "➖ Отписаться", "callback_data": "menu:unsubscribe"},
                    ],
                    [
                        {"text": "🌍 Все станции", "callback_data": "sub:all"},
                        {"text": "🗑 Сбросить все", "callback_data": "unsub:all"},
                    ],
                ]
            })

    elif action == "setlevel":
        valid = {"info", "warning", "error"}
        if value in valid:
            chat.notification_level = value
            chat.save(update_fields=["notification_level"])
            answer_callback(callback_id, f"✅ Уровень: {value.upper()}")
            edit_message_text(chat_id, message_id, f"✅ Уровень уведомлений установлен: <b>{value.upper()}</b>")

    elif action == "sub":
        if value == "all":
            StationSubscription.objects.filter(chat=chat).delete()
            StationSubscription.objects.create(chat=chat, station=None)
            answer_callback(callback_id, "✅ Подписка на все станции")
            edit_message_text(chat_id, message_id, "✅ Вы подписаны на <b>все</b> станции.")
        else:
            from stations.models import Station
            try:
                station = Station.objects.get(station_id=value)
                StationSubscription.objects.filter(chat=chat, station=None).delete()
                _, created = StationSubscription.objects.get_or_create(chat=chat, station=station)
                if created:
                    answer_callback(callback_id, f"✅ {station.name}")
                    edit_message_text(chat_id, message_id, f"✅ Подписка на <b>{station.name}</b> оформлена.")
                else:
                    answer_callback(callback_id, "Уже подписаны")
            except Station.DoesNotExist:
                answer_callback(callback_id, "Станция не найдена")

    elif action == "unsub":
        if value == "all":
            StationSubscription.objects.filter(chat=chat).delete()
            answer_callback(callback_id, "✅ Все подписки удалены")
            edit_message_text(chat_id, message_id, "✅ Все подписки удалены.")
        else:
            from stations.models import Station
            try:
                station = Station.objects.get(station_id=value)
                StationSubscription.objects.filter(chat=chat, station=station).delete()
                answer_callback(callback_id, f"✅ Отписаны от {station.name}")
                edit_message_text(chat_id, message_id, f"✅ Подписка на <b>{station.name}</b> удалена.")
            except Station.DoesNotExist:
                answer_callback(callback_id, "Станция не найдена")

    else:
        answer_callback(callback_id)


# ── Main dispatcher ───────────────────────────────────────────────────────────

BUTTON_MAP = {
    "📊 статус": "/status",
    "❌ просроченные": "/overdue",
    "🕐 окно": "/window",
    "📅 сегодня": "/today",
    "📈 статистика": "/stats",
    "📋 подписки": "/subscriptions",
    "⚙️ настройки": "settings",
    "❓ помощь": "/help",
}


def handle_message(message: dict):
    text: str = message.get("text", "").strip()
    if not text:
        return

    # Map reply keyboard buttons to commands
    mapped = BUTTON_MAP.get(text.lower())
    if mapped == "settings":
        _get_or_create_chat(message)
        handle_settings_menu(message)
        return
    if mapped:
        text = mapped

    if not text.startswith("/"):
        return

    parts = text.split()
    command = parts[0].split("@")[0].lower()
    args = parts[1:]

    dispatch = {
        "/start": lambda: handle_start(message),
        "/help": lambda: handle_help(message),
        "/status": lambda: handle_status(message),
        "/overdue": lambda: handle_overdue(message),
        "/window": lambda: handle_window(message),
        "/today": lambda: handle_today(message),
        "/stats": lambda: handle_stats(message),
        "/subscriptions": lambda: handle_subscriptions(message),
        "/settings": lambda: handle_settings_menu(message),
        "/subscribe": lambda: _handle_subscribe_cmd(message, args),
        "/unsubscribe": lambda: _handle_unsubscribe_cmd(message, args),
        "/setlevel": lambda: _handle_setlevel_cmd(message, args),
    }

    handler = dispatch.get(command)
    if handler:
        try:
            handler()
        except Exception:
            chat_id = message.get("chat", {}).get("id")
            if chat_id:
                send_message(chat_id, "⚠️ Произошла ошибка при обработке команды.")


def _handle_subscribe_cmd(message: dict, args: list[str]):
    chat = _get_or_create_chat(message)
    if not args or args[0].lower() == "all":
        StationSubscription.objects.filter(chat=chat).delete()
        StationSubscription.objects.create(chat=chat, station=None)
        send_message(chat.chat_id, "✅ Подписка на все станции оформлена.")
        return

    from stations.models import Station
    try:
        station = Station.objects.get(station_id=args[0].strip())
        StationSubscription.objects.filter(chat=chat, station=None).delete()
        _, created = StationSubscription.objects.get_or_create(chat=chat, station=station)
        if created:
            send_message(chat.chat_id, f"✅ Подписка на <b>{station.name}</b> оформлена.")
        else:
            send_message(chat.chat_id, f"ℹ️ Уже подписаны на <b>{station.name}</b>.")
    except Station.DoesNotExist:
        send_message(chat.chat_id, f"❌ Станция <code>{args[0]}</code> не найдена.")


def _handle_unsubscribe_cmd(message: dict, args: list[str]):
    chat = _get_or_create_chat(message)
    if not args or args[0].lower() == "all":
        StationSubscription.objects.filter(chat=chat).delete()
        send_message(chat.chat_id, "✅ Все подписки удалены.")
        return

    from stations.models import Station
    try:
        station = Station.objects.get(station_id=args[0].strip())
        StationSubscription.objects.filter(chat=chat, station=station).delete()
        send_message(chat.chat_id, f"✅ Подписка на <b>{station.name}</b> удалена.")
    except Station.DoesNotExist:
        send_message(chat.chat_id, f"❌ Станция <code>{args[0]}</code> не найдена.")


def _handle_setlevel_cmd(message: dict, args: list[str]):
    chat = _get_or_create_chat(message)
    valid = {"info", "warning", "error"}
    if not args or args[0].lower() not in valid:
        send_message(chat.chat_id, "Укажите уровень: <code>info</code>, <code>warning</code> или <code>error</code>")
        return
    chat.notification_level = args[0].lower()
    chat.save(update_fields=["notification_level"])
    send_message(chat.chat_id, f"✅ Уровень установлен: <b>{args[0].upper()}</b>")
