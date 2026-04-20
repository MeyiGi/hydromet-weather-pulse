import httpx
from django.conf import settings
from django.core.management.base import BaseCommand

COMMANDS = [
    ("start", "Начало работы"),
    ("status", "Сводка по всем станциям"),
    ("overdue", "Просроченные станции"),
    ("window", "Текущее окно SYNOP"),
    ("today", "Отчёт за сегодня"),
    ("stats", "Статистика за 7 дней"),
    ("subscriptions", "Мои подписки"),
    ("settings", "Настройки уведомлений"),
    ("help", "Справка"),
]


class Command(BaseCommand):
    help = "Register bot commands menu with Telegram BotFather API"

    def handle(self, *args, **options):
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not token:
            self.stderr.write("TELEGRAM_BOT_TOKEN is not set.")
            return

        commands = [{"command": cmd, "description": desc} for cmd, desc in COMMANDS]
        resp = httpx.post(
            f"https://api.telegram.org/bot{token}/setMyCommands",
            json={"commands": commands},
            timeout=10,
        )
        data = resp.json()
        if data.get("ok"):
            self.stdout.write(self.style.SUCCESS(f"Bot menu registered with {len(commands)} commands."))
            for cmd, desc in COMMANDS:
                self.stdout.write(f"  /{cmd} — {desc}")
        else:
            self.stderr.write(f"Failed: {data}")
