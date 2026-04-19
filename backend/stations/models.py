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

    def is_overdue(self) -> bool:
        if not self.last_seen:
            return True
        now = timezone.now()
        return (now - self.last_seen).total_seconds() > 3* 3600  # 3 hour
    
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