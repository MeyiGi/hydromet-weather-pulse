from django.urls import path
from .views import StationListView, SubmitDataView, WindowStatusView, StationAuthView, StationDetailView

urlpatterns = [
    path("", StationListView.as_view(), name="station-list"),
    path("window/", WindowStatusView.as_view(), name="window-status"),
    path("submit/", SubmitDataView.as_view(), name="submit"),
    path("<str:station_id>/auth/", StationAuthView.as_view(), name="station-auth"),
    path("<str:station_id>/", StationDetailView.as_view(), name="station-detail"),
]
