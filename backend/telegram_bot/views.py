import json
import logging

from django.http import HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from . import handlers

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class WebhookView(View):
    def post(self, request):
        try:
            update = json.loads(request.body)
            if "message" in update:
                handlers.handle_message(update["message"])
        except Exception:
            logger.exception("Telegram webhook error")
        # Always return 200 so Telegram doesn't retry
        return HttpResponse("OK")
