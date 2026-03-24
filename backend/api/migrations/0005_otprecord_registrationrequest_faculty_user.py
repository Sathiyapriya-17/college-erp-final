from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_faculty_email_phone'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # Add user field to Faculty model
        migrations.AddField(
            model_name='faculty',
            name='user',
            field=models.OneToOneField(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='faculty_profile',
                to='auth.user'
            ),
        ),

        # Create OTPRecord model
        migrations.CreateModel(
            name='OTPRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('otp', models.CharField(max_length=6)),
                ('reset_token', models.CharField(blank=True, max_length=64, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('expires_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),

        # Create RegistrationRequest model
        migrations.CreateModel(
            name='RegistrationRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('STUDENT', 'Student'), ('FACULTY', 'Faculty')], max_length=10)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING', max_length=10)),
                ('full_name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=15, null=True)),
                ('semester', models.IntegerField(blank=True, null=True)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('address', models.TextField(blank=True, null=True)),
                ('designation', models.CharField(blank=True, max_length=100, null=True)),
                ('qualification', models.CharField(blank=True, max_length=200, null=True)),
                ('experience_years', models.IntegerField(blank=True, null=True)),
                ('rejection_reason', models.TextField(blank=True, null=True)),
                ('reviewed_by', models.CharField(blank=True, max_length=100, null=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.department')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
