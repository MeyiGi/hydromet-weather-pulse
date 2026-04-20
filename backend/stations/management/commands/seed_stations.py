"""
Management command: populate 12 real Kyrgyzstan hydrometeorological stations.

Usage:
    python manage.py seed_stations
    python manage.py seed_stations --password synop2024   # custom default password
    python manage.py seed_stations --clear                # wipe existing stations first
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta

from stations.models import Station

STATIONS = [
    {
        "station_id": "38545",
        "name": "Бишкек",
        "location": "г. Бишкек, Чуйская область",
        "latitude": 42.8500,
        "longitude": 74.5300,
        "last_seen_offset_h": 1,   # hours ago (None = never)
    },
    {
        "station_id": "38711",
        "name": "Ош",
        "location": "г. Ош, Ошская область",
        "latitude": 40.5280,
        "longitude": 72.7830,
        "last_seen_offset_h": 2,
    },
    {
        "station_id": "38707",
        "name": "Жалал-Абад",
        "location": "г. Жалал-Абад, Жалал-Абадская область",
        "latitude": 40.9330,
        "longitude": 73.0000,
        "last_seen_offset_h": 5,   # overdue
    },
    {
        "station_id": "38606",
        "name": "Каракол",
        "location": "г. Каракол, Иссык-Кульская область",
        "latitude": 42.4920,
        "longitude": 78.3920,
        "last_seen_offset_h": 1,
    },
    {
        "station_id": "38626",
        "name": "Нарын",
        "location": "г. Нарын, Нарынская область",
        "latitude": 41.4300,
        "longitude": 76.0000,
        "last_seen_offset_h": 7,   # overdue
    },
    {
        "station_id": "38507",
        "name": "Талас",
        "location": "г. Талас, Таласская область",
        "latitude": 42.5200,
        "longitude": 72.2330,
        "last_seen_offset_h": 2,
    },
    {
        "station_id": "38548",
        "name": "Токмок",
        "location": "г. Токмок, Чуйская область",
        "latitude": 42.8380,
        "longitude": 75.2960,
        "last_seen_offset_h": None,  # never reported
    },
    {
        "station_id": "38816",
        "name": "Кызыл-Кия",
        "location": "г. Кызыл-Кия, Баткенская область",
        "latitude": 40.2580,
        "longitude": 72.1250,
        "last_seen_offset_h": 3,
    },
    {
        "station_id": "38817",
        "name": "Баткен",
        "location": "г. Баткен, Баткенская область",
        "latitude": 40.0700,
        "longitude": 70.8200,
        "last_seen_offset_h": 10,  # overdue
    },
    {
        "station_id": "38806",
        "name": "Исфана",
        "location": "г. Исфана, Баткенская область",
        "latitude": 39.8420,
        "longitude": 69.5280,
        "last_seen_offset_h": 2,
    },
    {
        "station_id": "38601",
        "name": "Чолпон-Ата",
        "location": "г. Чолпон-Ата, Иссык-Кульская область",
        "latitude": 42.6500,
        "longitude": 77.0830,
        "last_seen_offset_h": 1,
    },
    {
        "station_id": "38718",
        "name": "Казарман",
        "location": "с. Казарман, Джалал-Абадская область",
        "latitude": 41.4000,
        "longitude": 74.0330,
        "last_seen_offset_h": None,  # never reported
    },
]


class Command(BaseCommand):
    help = "Seed 12 Kyrgyzstan weather stations with real coordinates."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="synop2024",
            help="Default password for all stations (default: synop2024)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing stations before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            count, _ = Station.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} existing stations."))

        password_hash = make_password(options["password"])
        now = timezone.now()
        created = updated = 0

        for data in STATIONS:
            offset_h = data.pop("last_seen_offset_h")
            last_seen = now - timedelta(hours=offset_h) if offset_h is not None else None

            station, was_created = Station.objects.update_or_create(
                station_id=data["station_id"],
                defaults={
                    **data,
                    "password": password_hash,
                    "is_active": True,
                    "last_seen": last_seen,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: {created} created, {updated} updated.\n"
                f"Default password: {options['password']}\n"
                "\nStation IDs and passwords:\n" +
                "\n".join(f"  {s['station_id']:8} — password: {options['password']}" for s in STATIONS)
            )
        )
