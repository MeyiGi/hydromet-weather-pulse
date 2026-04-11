from dataclasses import dataclass
from typing import Any


@dataclass
class NotificationMessage:
    title: str
    body: str
    data: dict[str, Any] | None = None