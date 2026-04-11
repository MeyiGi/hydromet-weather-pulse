import httpx
from django.conf import settings

from ..types import NotificationMessage


class TelegramSender:
    def send(self, message: NotificationMessage) -> bool:
        if not (t := getattr(settings, "TELEGRAM_BOT_TOKEN", None)) or not (
            c := getattr(settings, "TELEGRAM_CHAT_ID", None)
        ):
            return False

        try:
            httpx.post(
                f"https://api.telegram.org/bot{t}/sendMessage",
                json={
                    "chat_id": c,
                    "text": f"<b>{message.title}</b>\n{message.body}",
                    "parse_mode": "HTML",
                },
                timeout=10,
            ).raise_for_status()
            return True

        except httpx.HTTPError:
            print("Failed to send Telegram notification")
            return False