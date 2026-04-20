from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.core import signing
from django.contrib.auth.hashers import check_password
import math

from .models import Station, DataSubmission
from .bootstrap import window_service
from notifications.tasks import deliver_notification

TOKEN_SALT = "station-auth"
TOKEN_MAX_AGE = 86400  # 24 hours


def _station_dict(s: Station, now=None) -> dict:
    if now is None:
        now = timezone.now()
    return {
        "station_id": s.station_id,
        "name": s.name,
        "location": s.location,
        "last_seen": s.last_seen,
        "submission_status": s.submission_status(),
        "is_active": s.is_active,
        "latitude": float(s.latitude) if s.latitude is not None else None,
        "longitude": float(s.longitude) if s.longitude is not None else None,
    }


class WindowStatusView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        now = timezone.now()
        current = window_service.current(now)
        duration_s = int((window_service.close_offset - window_service.open_offset).total_seconds())
        close_offset_min = int(window_service.close_offset.total_seconds() / 60)
        return Response(
            {
                "is_open": current is not None,
                "windows": window_service.hours,
                "window_duration_seconds": duration_s,
                "window_close_offset_minutes": close_offset_min,
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


class StationAuthView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, station_id):
        password = request.data.get("password", "").strip()
        if not password:
            return Response({"error": "password is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            station = Station.objects.get(station_id=station_id)
        except Station.DoesNotExist:
            return Response({"error": "Station not found"}, status=status.HTTP_404_NOT_FOUND)

        if not station.password or not check_password(password, station.password):
            return Response({"error": "Wrong password"}, status=status.HTTP_401_UNAUTHORIZED)

        token = signing.dumps({"station_id": station_id}, salt=TOKEN_SALT)
        return Response({"token": token})


class StationDetailView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, station_id):
        try:
            station = Station.objects.get(station_id=station_id)
        except Station.DoesNotExist:
            return Response({"error": "Station not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(_station_dict(station))


class StationListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        qs = Station.objects.all()

        # Status filter
        station_status = request.query_params.get("status", "all")
        if station_status in ("active", "on_time", "overdue"):
            qs = qs.filter(is_active=True)
        elif station_status == "inactive":
            qs = qs.filter(is_active=False)
        # "all" → no filter

        # Search filter
        search = request.query_params.get("search", "").strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(location__icontains=search))

        # Pagination params
        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = min(100, max(1, int(request.query_params.get("page_size", 10))))
        except (ValueError, TypeError):
            page = 1
            page_size = 10

        # submission_status is computed — must filter in Python before paginating
        if station_status in ("overdue", "on_time"):
            all_stations = [s for s in qs if s.submission_status() == station_status]
            total = len(all_stations)
            total_pages = max(1, math.ceil(total / page_size))
            page = min(page, total_pages)
            offset = (page - 1) * page_size
            stations = all_stations[offset: offset + page_size]
        else:
            total = qs.count()
            total_pages = max(1, math.ceil(total / page_size))
            page = min(page, total_pages)
            offset = (page - 1) * page_size
            stations = list(qs[offset: offset + page_size])

        return Response({
            "count": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "results": [_station_dict(s) for s in stations],
        })


class SubmitDataView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        now = timezone.now()
        current = window_service.current(now)

        if current is None:
            nxt = window_service.next(now)
            return Response({
                "error": "Submission window is closed.",
                "next_window": nxt.opens_at.isoformat(),
                "opens_in": nxt.opens_in(now),
            }, status=status.HTTP_403_FORBIDDEN)

        station_id = request.data.get("station_id", "").strip()
        raw_synop = request.data.get("raw_synop", "").strip()

        if not raw_synop:
            return Response({"error": "raw_synop is required"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Extract station_id from first SYNOP group if not explicitly provided
        if not station_id:
            first_group = raw_synop.split()[0] if raw_synop.split() else ""
            if first_group.isdigit() and len(first_group) == 5:
                station_id = first_group
            else:
                return Response(
                    {"error": "station_id not provided and could not be parsed from raw_synop (expected 5-digit WMO number as first group)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Validate auth token
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                data = signing.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
                if data.get("station_id") != station_id:
                    return Response({"error": "Token does not match station"},
                                    status=status.HTTP_403_FORBIDDEN)
            except signing.BadSignature:
                return Response({"error": "Invalid or expired token"},
                                status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"error": "Authorization required"},
                            status=status.HTTP_401_UNAUTHORIZED)

        try:
            station = Station.objects.get(station_id=station_id, is_active=True)
        except Station.DoesNotExist:
            return Response({"error": f"Station {station_id}, not found or inactive"},
                            status=status.HTTP_404_NOT_FOUND)

        submission = DataSubmission.objects.create(
            station=station,
            raw_synop=raw_synop,
            window_hour=current.hour,
        )

        station.last_seen = now
        station.save(update_fields=["last_seen"])

        local_time = timezone.localtime(current.opens_at).strftime("%H:%M")
        deliver_notification.delay(
            title="📡 Данные получены",
            body=f"Станция {station.name} ({station.station_id}) отправила данные в окне {local_time}.",
            level="info",
            data={"type": "data_received", "station_id": station.station_id},
        )

        return Response({
            "status": "received",
            "submission_id": submission.id,
            "station": station.station_id,
            "window_hour": current.hour,
            "closes_at": current.closes_at.isoformat(),
            "seconds_left": current.seconds_left(now),
        }, status=status.HTTP_201_CREATED)
