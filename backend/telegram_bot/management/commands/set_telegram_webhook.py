import httpx
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Register the Telegram webhook URL with the Bot API"

    def add_arguments(self, parser):
        parser.add_argument("url", help="Public HTTPS URL of your webhook endpoint, e.g. https://example.com/telegram/webhook/")

    def handle(self, *args, **options):
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not token:
            self.stderr.write("TELEGRAM_BOT_TOKEN is not set.")
            return

        url = options["url"].rstrip("/") + "/"
        resp = httpx.post(
            f"https://api.telegram.org/bot{token}/setWebhook",
            json={"url": url},
            timeout=10,
        )
        data = resp.json()
        if data.get("ok"):
            self.stdout.write(self.style.SUCCESS(f"Webhook set to: {url}"))
        else:
            self.stderr.write(f"Failed: {data}")
