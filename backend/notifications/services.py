from .types import NotificationMessage


class NotificationService:
    def __init__(self, senders):
        self.senders = senders

    def send(self, message: NotificationMessage):
        return [s.send(message) for s in self.senders]