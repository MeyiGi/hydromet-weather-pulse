from django.contrib import admin
from django.utils.html import format_html
from .models import DataSubmission, Station

# Register your models here.

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ["name", "station_id", "last_seen", "status_badge"]
    list_filter = ["is_active"]
    search_fields = ["name", "station_id"]

    def status_badge(self, obj):
        if obj.is_overdue():
            return format_html('<span style="color:red">{}</span>', '⚠ Overdue')
        return format_html('<span style="color:green">{}</span>', '✓ OK')
    status_badge.short_description = "Status"


@admin.register(DataSubmission)
class DateSubmissionAdmin(admin.ModelAdmin):
    list_display    = ["station", "timestamp", "window_hour", "forwarded"]
    list_filter     = ["forwarded", "window_hour"]
    readonly_fields = ["station", "timestamp", "raw_synop", "window_hour"]

