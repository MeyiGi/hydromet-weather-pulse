from celery import shared_task

from .models import Notification, PushToken
from .types import NotificationMessage
from .channels.telegram import TelegramSender
from .channels.expo import ExpoSender
from .channels.fcm import FCMSender
from .services import NotificationService

def _build_service() -> NotificationService:
    tokens = list(PushToken.objects.all())
    from telegram_bot.sender import TelegramBotSender
    return NotificationService(senders=[
        TelegramSender(),
        TelegramBotSender(),
        ExpoSender(tokens=[t.token for t in tokens if t.token_type == PushToken.TokenType.EXPO]),
        FCMSender(tokens=[t.token for t in tokens if t.token_type == PushToken.TokenType.FCM]),
    ])


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def deliver_notification(self, title, body: str, level: str = "info", data: dict = None):
    """send a notification to all channels, and log it in the database"""
    try:
        # saving in database for bell in app
        Notification.objects.create(title=title, body=body, level=level)

        message = NotificationMessage(title=title, body=body, data=data or {})
        _build_service().send(message)
    except Exception as exc:
        raise self.retry(exc=exc)