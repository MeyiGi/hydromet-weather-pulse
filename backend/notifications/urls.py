from django.urls import path
from .views import NotificationListView, RegisterTokenView, MarkReadView, MarkAllReadView

urlpatterns = [
    path("",               NotificationListView.as_view()),
    path("<int:pk>/read/", MarkReadView.as_view()),
    path("read-all/",      MarkAllReadView.as_view()),
    path("token/",         RegisterTokenView.as_view()),
]