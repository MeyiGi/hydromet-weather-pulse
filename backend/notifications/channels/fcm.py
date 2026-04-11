from django.conf import settings
import pathlib

from ..types import NotificationMessage

def get_app():
    import firebase_admin
    from firebase_admin import credentials

    if firebase_admin._apps:
        return firebase_admin.get_app()
    
    path: pathlib.Path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", None)
    if path is None or not path.exists():
        raise ValueError("Firebase credentials path is not set or does not exist.")
    
    return firebase_admin.initialize_app(credentials.Certificate(str(path)))


class FCMSender:
    def __init__(self, tokens: list[str]):
        self.tokens = tokens

    def send(self, message: NotificationMessage) -> bool:
        tokens = [t for t in self.tokens if not t.startswith("ExponentPushToken")]
        if not tokens or not get_app():
            return False

        from firebase_admin import messaging

        try:
            r = messaging.send_each_for_multicast(
                messaging.MulticastMessage(
                    tokens=tokens,
                    notification=messaging.Notification(
                        title=message.title,
                        body=message.body,
                    ),
                    data={k: str(v) for k, v in (message.data or {}).items()},
                )
            )
            return r.success_count > 0

        except Exception:
            print("Failed to send FCM notification")
            return False