from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Notification, PushToken


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "level", "created_at", "is_read"]
    list_filter  = ["level", "is_read"]


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ["token_type", "token", "created_at"]
    list_filter  = ["token_type"]