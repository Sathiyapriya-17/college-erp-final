from django.db import models
from django.contrib.auth.models import User
import random
import string
from datetime import timedelta
from django.utils import timezone

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    hod = models.CharField(max_length=100, null=True, blank=True)
    established = models.CharField(max_length=4, null=True, blank=True)
    status = models.CharField(max_length=20, default='Active')

    def __str__(self):
        return self.name

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    semester = models.IntegerField(default=1)
    credits = models.IntegerField(default=3)
    allocated_faculty = models.ForeignKey('Faculty', on_delete=models.SET_NULL, null=True, blank=True, related_name='allocated_courses')
    version = models.CharField(max_length=20, default="1.0")
    outcomes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Student(models.Model):
    STATUS_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Very Good', 'Very Good'),
        ('Good', 'Good'),
        ('Average', 'Average'),
        ('Poor', 'Poor'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='students')
    semester = models.IntegerField(default=1)
    gpa = models.FloatField(default=0.0)
    attendance = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Good')

    def __str__(self):
        return f"{self.student_id} - {self.name}"

class Faculty(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    faculty_id = models.CharField(max_length=20, unique=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='faculty')
    designation = models.CharField(max_length=100)
    joining_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name


class Notice(models.Model):
    TARGET_CHOICES = [
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty'),
        ('BOTH', 'Both'),
    ]
    PRIORITY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('IMPORTANT', 'Important'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_role = models.CharField(max_length=10, choices=TARGET_CHOICES, default='BOTH')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL')
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance', null=True)
    marked_by = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, related_name='marked_attendances')
    date = models.DateField()
    is_present = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course', 'date')

class Fee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    installment_number = models.IntegerField(default=1)
    paid_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Fee for {self.student.name}"

class Exam(models.Model):
    title = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    date = models.DateField()
    max_marks = models.IntegerField(default=100)
    google_form_link = models.URLField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    marks_obtained = models.FloatField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='Pending')

class TimetableEntry(models.Model):
    DAY_CHOICES = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
    ]
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField()
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    time_slot = models.CharField(max_length=50) # e.g. "09:00 AM - 10:00 AM"
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    room = models.CharField(max_length=50)

class ActivityLog(models.Model):
    user = models.CharField(max_length=100) # Could be modified to ForeignKey to User if auth is integrated
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']


class OTPRecord(models.Model):
    """Stores OTP codes for password reset."""
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    reset_token = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.pk:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    @staticmethod
    def generate_otp():
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def generate_token():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=64))

    def __str__(self):
        return f"OTP for {self.email}"

    class Meta:
        ordering = ['-created_at']


class RegistrationRequest(models.Model):
    """Stores student/faculty login account registration requests."""
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')

    # Common fields
    full_name = models.CharField(max_length=150)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)

    # Student-specific fields
    semester = models.IntegerField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # Faculty-specific fields
    designation = models.CharField(max_length=100, null=True, blank=True)
    qualification = models.CharField(max_length=200, null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)

    # Admin notes
    rejection_reason = models.TextField(null=True, blank=True)
    reviewed_by = models.CharField(max_length=100, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Generated Credentials Storage
    generated_username = models.CharField(max_length=50, null=True, blank=True)
    generated_password = models.CharField(max_length=50, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.role}: {self.full_name} ({self.status})"

    class Meta:
        ordering = ['-created_at']

class FacultyAttendance(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    is_present = models.BooleanField(default=True)
    remarks = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ('faculty', 'date')

class UserNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    theme_preference = models.CharField(max_length=50, default='lara-light-blue')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Preferences"

class NoticeAcknowledgment(models.Model):
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name='acknowledgments')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='notice_acknowledgments')
    acknowledged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('notice', 'faculty')
        ordering = ['-acknowledged_at']

    def __str__(self):
        return f"{self.faculty.name} acknowledged {self.notice.title}"
