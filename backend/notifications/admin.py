from django.contrib import admin
from .models import Notification, NotificationRead, PushToken


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "level", "created_at"]
    list_filter = ["level"]


@admin.register(NotificationRead)
class NotificationReadAdmin(admin.ModelAdmin):
    list_display = ["notification", "device_id", "read_at"]
    list_filter = ["device_id"]


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ["token_type", "token", "created_at"]
    list_filter = ["token_type"]
