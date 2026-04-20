from django.db import models
from django.utils import timezone

# Create your models here.

class Station(models.Model):
    name = models.CharField(max_length=255)
    station_id = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    password = models.CharField(max_length=255, blank=True)

    def submission_status(self) -> str:
        """Returns 'on_time', 'pending', or 'overdue' based on window config."""
        from .bootstrap import window_service
        now = timezone.now()

        current = window_service.current(now)
        if current:
            submitted = self.submissions.filter(
                window_hour=current.hour,
                timestamp__gte=current.opens_at,
                timestamp__lte=now,
            ).exists()
            return "on_time" if submitted else "pending"

        last = window_service.last_closed(now)
        if last is None:
            return "pending"
        submitted = self.submissions.filter(
            window_hour=last.hour,
            timestamp__gte=last.opens_at,
            timestamp__lte=last.closes_at,
        ).exists()
        return "on_time" if submitted else "overdue"
    
    def __str__(self):
        return f"{self.name} ({self.station_id})"
    

class DataSubmission(models.Model):
    station     = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="submissions")
    timestamp   = models.DateTimeField(auto_now_add=True)
    raw_synop   = models.TextField()
    window_hour = models.IntegerField()
    forwarded   = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.station.station_id} @ {self.timestamp:%Y-%m-%d %H:%M}"