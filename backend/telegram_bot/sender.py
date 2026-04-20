from notifications.types import NotificationMessage
from .bot import send_message
from .models import TelegramChat, StationSubscription


class TelegramBotSender:
    """
    Sends notifications to subscribed Telegram chats, respecting:
    - Per-chat notification level filter (info/warning/error)
    - Per-chat station subscriptions (specific stations or global)

    Routing rules per chat:
    - No subscription rows → receives everything
    - Has a global row (station=None) → receives everything
    - Has only specific station rows → receives only those stations
    Window events (no station_id in data) always pass through.
    """

    def send(self, message: NotificationMessage) -> bool:
        station_id = (message.data or {}).get("station_id")

        chats = TelegramChat.objects.filter(is_active=True)
        text = f"<b>{message.title}</b>\n{message.body}"
        sent_any = False

        for chat in chats:
            if not chat.accepts_level(message.level):
                continue

            if station_id and not self._chat_wants_station(chat, station_id):
                continue

            if send_message(chat.chat_id, text):
                sent_any = True

        return sent_any

    def _chat_wants_station(self, chat: TelegramChat, station_id: str) -> bool:
        subs = list(
            StationSubscription.objects.filter(chat=chat).select_related("station")
        )
        if not subs:
            return True  # no subscriptions → receives all

        for sub in subs:
            if sub.station is None:
                return True  # global subscription
            if sub.station.station_id == station_id:
                return True

        return False
