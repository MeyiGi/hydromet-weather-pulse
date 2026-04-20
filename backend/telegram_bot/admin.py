from django.contrib import admin

from .models import TelegramChat, StationSubscription


class StationSubscriptionInline(admin.TabularInline):
    model = StationSubscription
    extra = 0
    raw_id_fields = ["station"]


@admin.register(TelegramChat)
class TelegramChatAdmin(admin.ModelAdmin):
    list_display = ["chat_id", "username", "notification_level", "is_active", "created_at"]
    list_filter = ["notification_level", "is_active"]
    inlines = [StationSubscriptionInline]


@admin.register(StationSubscription)
class StationSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["chat", "station"]
    list_filter = ["chat"]
    raw_id_fields = ["chat", "station"]
