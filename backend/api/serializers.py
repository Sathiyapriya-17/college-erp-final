from rest_framework import serializers
from .models import (
    Department, Course, Student, Faculty, Notice, Attendance, Fee,
    Exam, ExamAttempt, TimetableEntry, ActivityLog, RegistrationRequest,
    FacultyAttendance, UserNotification, UserPreference, NoticeAcknowledgment
)

class DepartmentSerializer(serializers.ModelSerializer):
    faculty_count = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'hod', 'established', 'status', 'faculty_count', 'student_count']

    def get_faculty_count(self, obj):
        return obj.faculty.count()

    def get_student_count(self, obj):
        return obj.students.count()

class CourseSerializer(serializers.ModelSerializer):
    allocated_faculty_name = serializers.CharField(source='allocated_faculty.name', read_only=True)
    class Meta:
        model = Course
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = Student
        fields = '__all__'

class FacultySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'faculty_id', 'email', 'phone', 'department', 'department_name', 'designation', 'joining_date']

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False, allow_null=True)
    class Meta:
        model = Attendance
        fields = '__all__'

class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    roll_no = serializers.CharField(source='student.student_id', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'roll_no', 'course', 'course_name', 'date', 'is_present']

class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = Exam
        fields = '__all__'

class ExamAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    class Meta:
        model = ExamAttempt
        fields = '__all__'

class TimetableEntrySerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    class Meta:
        model = TimetableEntry
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'

class RegistrationRequestSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    role_label = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'role', 'role_label', 'status', 'status_label',
            'full_name', 'email', 'phone', 'department', 'department_name',
            'semester', 'date_of_birth', 'address',
            'designation', 'qualification', 'experience_years',
            'rejection_reason', 'reviewed_by', 'reviewed_at',
            'generated_username', 'generated_password',
            'created_at', 'updated_at'
        ]

    def get_role_label(self, obj):
        return obj.get_role_display()

    def get_status_label(self, obj):
        return obj.get_status_display()

class FacultyAttendanceSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    faculty_id_display = serializers.CharField(source='faculty.faculty_id', read_only=True)

    class Meta:
        model = FacultyAttendance
        fields = ['id', 'faculty', 'faculty_name', 'faculty_id_display', 'date', 'is_present', 'remarks']

class UserNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = '__all__'

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['theme_preference', 'profile_picture']

class NoticeAcknowledgmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    
    class Meta:
        model = NoticeAcknowledgment
        fields = '__all__'
