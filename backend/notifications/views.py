from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Notification, PushToken


class NotificationListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        notifs = Notification.objects.all()
        return Response([{
            "id" : n.id,
            "title" : n.title,
            "body": n.body,
            "level" : n.level,
            "created_at" : n.created_at,
            "is_read" : n.is_read,
        } for n in notifs])
    

class MarkReadView(APIView):
    authentication_classes = []
    permission_classes = []

    def patch(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk)
            n.is_read = True
            n.save(update_fields=["is_read"])
            return Response({"status": "ok"})
        except Notification.DoesNotExist:
            return Response({"error" : "Not found"}, status=404)
        

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