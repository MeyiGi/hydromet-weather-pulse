from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="notification",
            name="is_read",
        ),
        migrations.CreateModel(
            name="NotificationRead",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("notification", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reads", to="notifications.notification")),
                ("device_id", models.CharField(db_index=True, max_length=64)),
                ("read_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"unique_together": {("notification", "device_id")}},
        ),
    ]
