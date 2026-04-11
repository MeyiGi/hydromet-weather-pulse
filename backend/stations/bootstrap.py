from django.conf import settings
from .windows import WindowService


window_service = WindowService(
    hours=getattr(settings, "NOTIFICATION_HOURS", [8, 12, 16]),
    open_offset_min=getattr(settings, "NOTIFICATION_OPEN_OFFSET_MIN", -15),
    close_offset_min=getattr(settings, "NOTIFICATION_CLOSE_OFFSET_MIN", 15),
)
