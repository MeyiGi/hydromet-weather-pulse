from django.db import models

# Create your models here.

class PushToken(models.Model):
    """One row per device that has the app installed."""

    class TokenType(models.TextChoices):
        EXPO = "expo", "Expo (React Native)"
        FCM = "fcm", "Firebase (Web / Android)"

    token = models.CharField(max_length=300, unique=True)
    token_type = models.CharField(max_length=10, choices=TokenType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.token_type} - {self.token[:15]}"
    

class Notification(models.Model):
    """Persistent log of every notification sent - shown in the in-app bell."""

    class Level(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"

    title = models.CharField(max_length=255)
    body = models.TextField()
    level = models.CharField(max_length=10, choices=Level.choices, default=Level.INFO)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.level.upper()} - {self.title}"