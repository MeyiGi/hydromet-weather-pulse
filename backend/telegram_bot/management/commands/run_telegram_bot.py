import time
import logging

import httpx
from django.conf import settings
from django.core.management.base import BaseCommand

from telegram_bot import handlers

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Run the Telegram bot in long-polling mode"

    def handle(self, *args, **options):
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not token:
            self.stderr.write("TELEGRAM_BOT_TOKEN is not set.")
            return

        self.stdout.write("Telegram bot started (polling)...")
        offset = 0

        while True:
            try:
                resp = httpx.get(
                    f"https://api.telegram.org/bot{token}/getUpdates",
                    params={"timeout": 30, "offset": offset},
                    timeout=35,
                )
                data = resp.json()

                for update in data.get("result", []):
                    offset = update["update_id"] + 1
                    try:
                        if "message" in update:
                            handlers.handle_message(update["message"])
                        elif "callback_query" in update:
                            handlers.handle_callback_query(update["callback_query"])
                    except Exception:
                        logger.exception("Error handling update %s", update["update_id"])

            except httpx.TimeoutException:
                pass  # normal for long polling
            except Exception:
                logger.exception("Polling error, retrying in 5s")
                time.sleep(5)
