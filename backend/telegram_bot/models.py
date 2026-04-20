from django.db import models


LEVEL_ORDER = {"info": 0, "warning": 1, "error": 2}


class TelegramChat(models.Model):
    class Level(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"

    chat_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255, blank=True)
    notification_level = models.CharField(
        max_length=10, choices=Level.choices, default=Level.INFO
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def accepts_level(self, level: str) -> bool:
        return LEVEL_ORDER.get(level, 0) >= LEVEL_ORDER.get(self.notification_level, 0)

    def __str__(self):
        return f"@{self.username or self.chat_id}"


class StationSubscription(models.Model):
    """
    Tracks which stations a chat wants alerts for.
    station=None means the chat subscribes to ALL stations (global).
    If a chat has no rows here it also receives everything (new user default).
    If a chat has only station-specific rows it ONLY receives those stations.
    """

    chat = models.ForeignKey(
        TelegramChat, on_delete=models.CASCADE, related_name="subscriptions"
    )
    station = models.ForeignKey(
        "stations.Station",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="telegram_subscriptions",
    )

    class Meta:
        unique_together = [("chat", "station")]

    def __str__(self):
        station_label = self.station.station_id if self.station else "ALL"
        return f"{self.chat} → {station_label}"
