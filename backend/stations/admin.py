from django import forms
from django.contrib import admin
from django.contrib.auth.hashers import make_password, identify_hasher
from django.utils.html import format_html
from .models import DataSubmission, Station


class StationAdminForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(render_value=False),
        required=False,
        help_text="Введите новый пароль. Оставьте пустым чтобы не менять.",
    )

    class Meta:
        model = Station
        fields = "__all__"


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    form = StationAdminForm
    list_display = ["name", "station_id", "last_seen", "status_badge"]
    list_filter = ["is_active"]
    search_fields = ["name", "station_id"]

    def status_badge(self, obj):
        if obj.is_overdue():
            return format_html('<span style="color:red">{}</span>', '⚠ Overdue')
        return format_html('<span style="color:green">{}</span>', '✓ OK')
    status_badge.short_description = "Status"

    def save_model(self, request, obj, form, change):
        new_password = form.cleaned_data.get("password")
        if new_password:
            obj.password = make_password(new_password)
        elif change:
            # keep existing hash if field left blank
            obj.password = Station.objects.get(pk=obj.pk).password
        super().save_model(request, obj, form, change)


@admin.register(DataSubmission)
class DateSubmissionAdmin(admin.ModelAdmin):
    list_display    = ["station", "timestamp", "window_hour", "forwarded"]
    list_filter     = ["forwarded", "window_hour"]
    readonly_fields = ["station", "timestamp", "raw_synop", "window_hour"]

