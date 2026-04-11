from django.urls import path
from .views import NotificationListView, RegisterTokenView, MarkReadView

urlpatterns = [
    path("",               NotificationListView.as_view()),
    path("<int:pk>/read/", MarkReadView.as_view()),
    path("token/",         RegisterTokenView.as_view()),
]