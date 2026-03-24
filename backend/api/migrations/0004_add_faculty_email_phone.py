from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_activitylog_alter_attendance_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='faculty',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='faculty',
            name='phone',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
