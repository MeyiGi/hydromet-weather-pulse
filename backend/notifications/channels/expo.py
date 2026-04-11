import httpx

from ..types import NotificationMessage

URL = "https://exp.host/--/api/v2/push/send"


class ExpoSender:
    def __init__(self, tokens: list[str]):
        self.tokens = tokens

    def send(self, message: NotificationMessage) -> bool:
        tokens = [t for t in self.tokens if t.startswith("ExponentPushToken")]
        if not tokens:
            return False

        try:
            httpx.post(
                URL,
                json=[
                    {
                        "to": t,
                        "title": message.title,
                        "body": message.body,
                        "data": message.data or {},
                        "sound": "default",
                    }
                    for t in tokens
                ],
                timeout=10,
            ).raise_for_status()
            return True

        except httpx.HTTPError:
            print("Failed to send Expo notification")
            return False