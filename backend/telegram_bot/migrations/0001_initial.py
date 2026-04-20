from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("stations", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TelegramChat",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("chat_id", models.BigIntegerField(unique=True)),
                ("username", models.CharField(blank=True, max_length=255)),
                ("notification_level", models.CharField(
                    choices=[("info", "Info"), ("warning", "Warning"), ("error", "Error")],
                    default="info",
                    max_length=10,
                )),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="StationSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("chat", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="subscriptions",
                    to="telegram_bot.telegramchat",
                )),
                ("station", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="telegram_subscriptions",
                    to="stations.station",
                )),
            ],
            options={
                "unique_together": {("chat", "station")},
            },
        ),
    ]
