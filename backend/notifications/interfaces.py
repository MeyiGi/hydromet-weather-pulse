from typing import Protocol


class NotificationSender(Protocol):
    def send(self, *args, **kwargs) -> bool: ...