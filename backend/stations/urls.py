from django.urls import path
from .views import StationListView, SubmitDataView, WindowStatusView

urlpatterns = [
    path("", StationListView.as_view(), name="station-list"),
    path("window/", WindowStatusView.as_view(), name="window-status"),
    path("submit/", SubmitDataView.as_view(), name="submit"),

]