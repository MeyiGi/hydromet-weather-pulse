from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Notification, NotificationRead, PushToken


class NotificationListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        device_id = request.query_params.get("device_id", "")
        notifs = Notification.objects.all()
        if device_id:
            read_ids = set(
                NotificationRead.objects.filter(device_id=device_id)
                .values_list("notification_id", flat=True)
            )
        else:
            read_ids = set()
        return Response([{
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "level": n.level,
            "created_at": n.created_at,
            "is_read": n.id in read_ids,
        } for n in notifs])


class MarkReadView(APIView):
    authentication_classes = []
    permission_classes = []

    def patch(self, request, pk):
        device_id = request.data.get("device_id", "").strip()
        if not device_id:
            return Response({"error": "device_id required"}, status=400)
        try:
            n = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
        NotificationRead.objects.get_or_create(notification=n, device_id=device_id)
        return Response({"status": "ok"})


class RegisterTokenView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.data.get("token", "").strip()
        token_type = request.data.get("token_type", "").strip()

        if not token or token_type not in ("expo", "fcm"):
            return Response({"error": "token and token type required"}, status=400)

        PushToken.objects.update_or_create(
            token=token,
            defaults={"token_type": token_type}
        )

        return Response({"status": "registered"})
