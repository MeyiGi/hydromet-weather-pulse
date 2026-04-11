from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import Station, DataSubmission
from .bootstrap import window_service
from notifications.tasks import deliver_notification


class WindowStatusView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        now = timezone.now()
        current = window_service.current(now)
        return Response(
            {
                "is_open": current is not None,
                "current": (
                    {
                        "hour": current.hour,
                        "opens_at": current.opens_at.isoformat(),
                        "closes_at": current.closes_at.isoformat(),
                        "seconds_left": current.seconds_left(now),
                    }
                    if current
                    else None
                ),
                "next": (
                    {
                        "hour": window_service.next(now).hour,
                        "opens_at": window_service.next(now).opens_at.isoformat(),
                        "opens_in_seconds": window_service.next(now).opens_in(now),
                    }
                    if not current
                    else None
                ),
            }
        )


class SubmitDataView(APIView):
    """Endpoint for stations to submit data."""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        now = timezone.now()
        current = window_service.current(now)

        if current is None:
            nxt = window_service.next(now)
            return Response({
                "error":      "Submission window is closed.",
                "next_window": nxt.opens_at.isoformat(),
                "opens_in":    nxt.opens_in(now),
            }, status=status.HTTP_403_FORBIDDEN)

        station_id = request.data.get("station_id", "").strip()
        raw_synop = request.data.get("raw_synop", "").strip()

        if not station_id or not raw_synop:
            return Response({"error": "station_id and raw_synop are required fields"},
                              status=status.HTTP_400_BAD_REQUEST)
        
        try:
            station = Station.objects.get(station_id=station_id, is_active=True)
        except Station.DoesNotExist:
            return Response({"error" : f"Station {station_id}, not found or inactive"},
                             status=status.HTTP_404_NOT_FOUND,)
        
        # Saving
        submission = DataSubmission.objects.create(
            station=station, 
            raw_synop=raw_synop,
            window_hour=current.hour,
        )

        station.last_seen = now
        station.save(update_fields=["last_seen"])

        # deliver notification that datas received
        deliver_notification.delay(
            title="📡 Data received",
            body=f"Station {station.name} submitted for window {current.hour:02d}:00 UTC.",
            level="info",
        )

        return Response({
            "status":       "received",
            "submission_id": submission.id,
            "station":      station.station_id,
            "window_hour":  current.hour,
            "closes_at":    current.closes_at.isoformat(),
            "seconds_left": current.seconds_left(now),
        }, status=status.HTTP_201_CREATED)
    

class StationListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, requets):
        stations = Station.objects.filter(is_active=True)
        return Response([{
            "station_id": s.station_id,
            "name" : s.name,
            "location" : s.location,
            "last_seen" : s.last_seen,
            "is_overdue": s.is_overdue(),
        } for s in stations])