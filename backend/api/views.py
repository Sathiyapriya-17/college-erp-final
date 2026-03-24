from rest_framework import viewsets
from .models import (
    Department, Course, Student, Faculty, Notice, Attendance, Fee,
    Exam, ExamAttempt, TimetableEntry, ActivityLog, OTPRecord, RegistrationRequest,
    FacultyAttendance, UserNotification, UserPreference, NoticeAcknowledgment
)
from .serializers import (
    DepartmentSerializer, CourseSerializer, StudentSerializer,
    FacultySerializer, NoticeSerializer, AttendanceSerializer, FeeSerializer,
    ExamSerializer, ExamAttemptSerializer, TimetableEntrySerializer, ActivityLogSerializer,
    RegistrationRequestSerializer, FacultyAttendanceSerializer, UserNotificationSerializer,
    UserPreferenceSerializer, NoticeAcknowledgmentSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Avg, Sum, Max, Q
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import random
import string


# ---------------------------------------------------------------------------
# Helper utility
# ---------------------------------------------------------------------------
def _generate_password(length=10):
    chars = string.ascii_letters + string.digits + '!@#$'
    return ''.join(random.choices(chars, k=length))


# ---------------------------------------------------------------------------
# Existing ViewSets (unchanged)
# ---------------------------------------------------------------------------

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        dept = self.get_object()
        from django.db.models import Avg
        
        students = Student.objects.filter(department=dept)
        faculty = Faculty.objects.filter(department=dept)
        
        avg_gpa = students.aggregate(Avg('gpa'))['gpa__avg'] or 0
        avg_attendance = students.aggregate(Avg('attendance'))['attendance__avg'] or 0
        
        stats = {
            'department_name': dept.name,
            'total_students': students.count(),
            'total_faculty': faculty.count(),
            'average_gpa': round(avg_gpa, 2),
            'average_attendance': round(avg_attendance, 2)
        }
        return Response(stats)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        department = self.request.query_params.get('department')
        semester = self.request.query_params.get('semester')
        if department:
            queryset = queryset.filter(department_id=department)
        if semester:
            queryset = queryset.filter(semester=semester)
        return queryset

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        queryset = Student.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        department = self.request.query_params.get('department', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if department:
            queryset = queryset.filter(department_id=department)
        return queryset

    @action(detail=False, methods=['get'])
    def export(self, request):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="students_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Student ID', 'Name', 'Department', 'Semester', 'GPA', 'Attendance (%)', 'Status'])
        
        for student in self.get_queryset():
            writer.writerow([
                student.student_id,
                student.name,
                student.department.name if student.department else 'N/A',
                student.semester,
                student.gpa,
                student.attendance,
                student.status
            ])
            
        return response

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        if user:
            user.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Prepare User Creation
        student_id = serializer.validated_data.get('student_id', '')
        year = timezone.now().year
        name = serializer.validated_data.get('name', 'Student')
        count = Student.objects.filter(student_id__startswith=f'STU{year}').count() + 1
        username = f"PCMKPM{year}{count:02d}"
        
        # Ensure unique username
        base_username = username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{suffix}"
            suffix += 1

        temp_password = "PCMKPM@123"

        # Create User
        user = User.objects.create_user(
            username=username,
            password=temp_password,
            first_name=name.split()[0],
            last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else ''
        )

        # Save Student with User
        student = serializer.save(user=user)
        
        data = serializer.data
        data['generated_username'] = username
        data['generated_password'] = temp_password
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    def get_queryset(self):
        queryset = Faculty.objects.all()
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department_id=department)
        return queryset

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        if user:
            user.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Prepare User Creation
        year = timezone.now().year
        name = serializer.validated_data.get('name', 'Faculty')
        count = Faculty.objects.count() + 1
        username = f"PCMKPMFAC{year}{count:02d}"
        
        # Ensure unique username
        base_username = username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{suffix}"
            suffix += 1

        temp_password = "PCMKPM@123"

        # Create User
        user = User.objects.create_user(
            username=username,
            password=temp_password,
            first_name=name.split()[0],
            last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else ''
        )

        # Save Faculty with User
        faculty = serializer.save(user=user)
        
        data = serializer.data
        data['generated_username'] = username
        data['generated_password'] = temp_password
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer

    def perform_create(self, serializer):
        notice = serializer.save()
        title = f"New Notice: {notice.title}"
        msg = notice.description[:100] + "..." if len(notice.description) > 100 else notice.description
        
        notifications = []
        if notice.target_role in ['STUDENT', 'BOTH']:
            students = Student.objects.filter(user__isnull=False)
            for student in students:
                notifications.append(UserNotification(user=student.user, title=title, message=msg, action_url='/notices'))
        
        if notice.target_role in ['FACULTY', 'BOTH']:
            faculties = Faculty.objects.filter(user__isnull=False)
            for faculty in faculties:
                notifications.append(UserNotification(user=faculty.user, title=title, message=msg, action_url='/notices'))
                
        if notifications:
            UserNotification.objects.bulk_create(notifications)

class NoticeAcknowledgmentViewSet(viewsets.ModelViewSet):
    queryset = NoticeAcknowledgment.objects.all()
    serializer_class = NoticeAcknowledgmentSerializer

    def get_queryset(self):
        queryset = NoticeAcknowledgment.objects.all()
        notice_id = self.request.query_params.get('notice')
        faculty_id = self.request.query_params.get('faculty')
        if notice_id:
            queryset = queryset.filter(notice_id=notice_id)
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
        return queryset

    @action(detail=False, methods=['post'])
    def acknowledge(self, request):
        notice_id = request.data.get('notice')
        faculty_id = request.data.get('faculty')
        
        if not notice_id or not faculty_id:
            return Response({'error': 'Notice and Faculty IDs are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        from .models import NoticeAcknowledgment
        ack, created = NoticeAcknowledgment.objects.get_or_create(notice_id=notice_id, faculty_id=faculty_id)
        return Response(NoticeAcknowledgmentSerializer(ack).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = Attendance.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        date = self.request.query_params.get('date', None)
        course = self.request.query_params.get('course', None)
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        if date:
            queryset = queryset.filter(date=date)
        if course:
            queryset = queryset.filter(course_id=course)
        return queryset

    @action(detail=False, methods=['get'])
    def export(self, request):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendance_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Student ID', 'Student Name', 'Course', 'Status'])
        
        for att in self.get_queryset().select_related('student', 'course'):
            writer.writerow([
                att.date,
                att.student.student_id,
                att.student.name,
                att.course.name if att.course else 'N/A',
                'Present' if att.is_present else 'Absent'
            ])
            
        return response

    @action(detail=False, methods=['get'], url_path='low-attendance')
    def low_attendance(self, request):
        try:
            threshold = float(request.query_params.get('threshold', 75.0))
        except ValueError:
            threshold = 75.0
            
        low_students = Student.objects.filter(attendance__lt=threshold)
        return Response(StudentSerializer(low_students, many=True).data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        records_data = request.data.get('records', [])
        if not records_data:
            return Response({'error': 'No records provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        res = []
        for rd in records_data:
            student_id = rd.get('student')
            course_id = rd.get('course')
            date = rd.get('date')
            is_present = rd.get('is_present', True)
            
            if not student_id or not date:
                continue
                
            att, _ = Attendance.objects.update_or_create(
                student_id=student_id,
                course_id=course_id,
                date=date,
                defaults={'is_present': is_present}
            )
            res.append(AttendanceSerializer(att).data)
            
        return Response(res, status=status.HTTP_201_CREATED)

class FacultyAttendanceViewSet(viewsets.ModelViewSet):
    queryset = FacultyAttendance.objects.all()
    serializer_class = FacultyAttendanceSerializer

    def get_queryset(self):
        queryset = FacultyAttendance.objects.all()
        date = self.request.query_params.get('date', None)
        department = self.request.query_params.get('department', None)
        faculty_id = self.request.query_params.get('faculty_id', None)
        
        if date:
            queryset = queryset.filter(date=date)
        if department:
            queryset = queryset.filter(faculty__department_id=department)
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
            
        return queryset

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        records_data = request.data.get('records', [])
        if not records_data:
            return Response({'error': 'No records provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        res = []
        for rd in records_data:
            faculty_id = rd.get('faculty')
            date = rd.get('date')
            is_present = rd.get('is_present', True)
            remarks = rd.get('remarks', '')
            
            if not faculty_id or not date:
                continue
                
            att, _ = FacultyAttendance.objects.update_or_create(
                faculty_id=faculty_id,
                date=date,
                defaults={'is_present': is_present, 'remarks': remarks}
            )
            res.append(FacultyAttendanceSerializer(att).data)
            
        return Response(res, status=status.HTTP_201_CREATED)

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer

    def get_queryset(self):
        queryset = Fee.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        return queryset

    @action(detail=True, methods=['post'])
    def pay_online(self, request, pk=None):
        fee = self.get_object()
        if fee.is_paid:
            return Response({'error': 'Fee is already paid'}, status=status.HTTP_400_BAD_REQUEST)
            
        fee.is_paid = True
        fee.paid_date = timezone.now().date()
        fee.payment_reference = f"TXN{random.randint(100000, 999999)}"
        fee.save()
        return Response({'status': 'Payment successful', 'transaction_id': fee.payment_reference})
        
    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        fee = self.get_object()
        if not fee.is_paid:
            return Response({'error': 'Cannot generate receipt for unpaid fee'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="Receipt_{fee.id}.txt"'
        
        receipt_text = f"""
        =======================================
               COLLEGE ERP - FEE RECEIPT
        =======================================
        Receipt No: {fee.payment_reference}
        Date: {fee.paid_date}
        
        Student: {fee.student.name} ({fee.student.student_id})
        Department: {fee.student.department.name}
        
        Amount Paid: {fee.amount}
        Fine Paid: {fee.fine_amount}
        Installment No: {fee.installment_number}
        =======================================
        """
        response.write(receipt_text)
        return response

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def get_queryset(self):
        queryset = Exam.objects.all()
        department = self.request.query_params.get('department')
        course = self.request.query_params.get('course')
        faculty = self.request.query_params.get('faculty')
        
        if department:
            queryset = queryset.filter(department_id=department)
        if course:
            queryset = queryset.filter(course_id=course)
        if faculty:
            queryset = queryset.filter(faculty_id=faculty)
        return queryset
        
    def perform_create(self, serializer):
        exam = serializer.save()
        self._send_exam_notification(exam, is_new=True)
        self._create_in_app_notification(exam, is_new=True)
        
    def perform_update(self, serializer):
        exam = serializer.save()
        self._send_exam_notification(exam, is_new=False)
        self._create_in_app_notification(exam, is_new=False)
        
    def _create_in_app_notification(self, exam, is_new):
        title = f"{'New Exam Scheduled' if is_new else 'Exam Updated'}: {exam.title}"
        msg = f"An exam for {exam.course.name} has been { 'scheduled' if is_new else 'updated' } for {exam.date}."
        
        # Notify Faculty
        if exam.faculty.user:
            UserNotification.objects.create(user=exam.faculty.user, title=title, message=msg, action_url='/examinations')
            
        # Notify Students
        students = Student.objects.filter(department=exam.department)
        for student in students:
            if student.user:
                UserNotification.objects.create(user=student.user, title=title, message=msg, action_url='/academics/timetable')

    def _send_exam_notification(self, exam, is_new):
        try:
            subject = f"College ERP - {'New Exam Scheduled' if is_new else 'Exam Updated'}: {exam.title}"
            message = f"An exam for {exam.course.name} has been {'scheduled' if is_new else 'updated'}.\nDate: {exam.date}\nMax Marks: {exam.max_marks}"
            recipient_list = []
            
            if exam.faculty.email:
                recipient_list.append(exam.faculty.email)
                
            students = Student.objects.filter(department=exam.department)
            for student in students:
                if student.user and student.user.email:
                    recipient_list.append(student.user.email)
                    
            if recipient_list:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_list,
                    fail_silently=True,
                )
        except Exception:
            pass

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        exam = self.get_object()
        exam.is_approved = True
        exam.save()
        return Response({'status': 'Exam results approved', 'exam_id': exam.id}, status=status.HTTP_200_OK)

class ExamAttemptViewSet(viewsets.ModelViewSet):
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer

    def get_queryset(self):
        queryset = ExamAttempt.objects.all()
        exam_id = self.request.query_params.get('exam')
        student_id = self.request.query_params.get('student')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

    @action(detail=False, methods=['post'])
    def enter_marks(self, request):
        exam_id = request.data.get('exam')
        marks_data = request.data.get('marks', []) # List of {student_id, marks_obtained}
        
        if not exam_id or not marks_data:
            return Response({'error': 'Exam ID and marks data are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        exam = Exam.objects.filter(id=exam_id).first()
        if not exam:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
            
        updated_attempts = []
        for mark_info in marks_data:
            student_id = mark_info.get('student')
            marks = mark_info.get('marks_obtained')
            
            if student_id is not None and marks is not None:
                attempt, created = ExamAttempt.objects.get_or_create(
                    exam=exam,
                    student_id=student_id,
                    defaults={'status': 'Graded', 'marks_obtained': marks}
                )
                
                if not created:
                    attempt.marks_obtained = marks
                    attempt.status = 'Graded'
                    attempt.save()
                    
                updated_attempts.append(attempt)
                
                # Recalculate CGPA (Simplified: Avg of all Graded ExamAttempts percentage * 10)
                student = attempt.student
                all_attempts = ExamAttempt.objects.filter(student=student, status='Graded')
                if all_attempts.exists():
                    total_percentage = 0
                    for att in all_attempts:
                        if att.exam.max_marks > 0:
                            total_percentage += (att.marks_obtained / att.exam.max_marks) * 100
                    avg_percentage = total_percentage / all_attempts.count()
                    student.gpa = round(avg_percentage / 10, 2) # CGPA out of 10
                    student.save()
                    
                # Send email notification
                if student.user and student.user.email:
                    try:
                        send_mail(
                            subject=f"College ERP - Marks Published for {exam.title}",
                            message=f"Dear {student.name},\n\nYour marks for {exam.title} have been published.\nMarks Obtained: {marks}/{exam.max_marks}\n\nLogin to the dashboard to view your updated CGPA.",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[student.user.email],
                            fail_silently=True,
                        )
                    except Exception:
                        pass
                        
        serializer = self.get_serializer(updated_attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TimetableEntryViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.all()
    serializer_class = TimetableEntrySerializer

    DAY_MAP = {
        'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED',
        'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT',
        'MON': 'MON', 'TUE': 'TUE', 'WED': 'WED',
        'THU': 'THU', 'FRI': 'FRI', 'SAT': 'SAT',
    }

    def get_queryset(self):
        queryset = TimetableEntry.objects.all()
        department = self.request.query_params.get('department')
        semester = self.request.query_params.get('semester')
        if department:
            queryset = queryset.filter(department_id=department)
        if semester:
            queryset = queryset.filter(semester=semester)
        return queryset

    def _transform_data(self, data):
        transformed = dict(data)
        if 'day' in transformed:
            transformed['day'] = self.DAY_MAP.get(transformed['day'], transformed['day'])
        if 'start_time' in transformed and 'time_slot' not in transformed:
            transformed['time_slot'] = transformed.pop('start_time')
        if 'subject' in transformed and 'course' not in transformed:
            subject_name = transformed.pop('subject')
            try:
                course = Course.objects.filter(name__iexact=subject_name).first()
                if not course:
                    dept_id = transformed.get('department')
                    course = Course.objects.create(
                        name=subject_name,
                        code=subject_name[:10].upper().replace(' ', '_'),
                        department_id=dept_id,
                        credits=3
                    )
                transformed['course'] = course.id
            except Exception:
                pass
        if 'faculty_name' in transformed and 'faculty' not in transformed:
            faculty_name = transformed.pop('faculty_name')
            try:
                faculty = Faculty.objects.filter(name__iexact=faculty_name).first()
                if not faculty:
                    dept_id = transformed.get('department')
                    faculty = Faculty.objects.create(
                        name=faculty_name,
                        faculty_id=f"FAC_{faculty_name[:6].upper()}",
                        department_id=dept_id,
                        designation='Lecturer'
                    )
                transformed['faculty'] = faculty.id
            except Exception:
                pass
        return transformed

    def create(self, request, *args, **kwargs):
        data = self._transform_data(request.data)
        
        conflicts = TimetableEntry.objects.filter(
            day=data.get('day'),
            time_slot=data.get('time_slot')
        ).filter(
            Q(faculty_id=data.get('faculty')) | Q(room=data.get('room'))
        )
        if conflicts.exists():
            return Response({'error': 'Schedule conflict detected for the given faculty or room.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        self._create_timetable_notification(instance, "scheduled")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        data = self._transform_data(request.data)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        conflicts = TimetableEntry.objects.filter(
            day=data.get('day', instance.day),
            time_slot=data.get('time_slot', instance.time_slot)
        ).filter(
            Q(faculty_id=data.get('faculty', instance.faculty_id)) | Q(room=data.get('room', instance.room))
        ).exclude(pk=instance.pk)
        
        if conflicts.exists():
            return Response({'error': 'Schedule conflict detected for the given faculty or room.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        self._create_timetable_notification(instance, "updated")
        return Response(serializer.data)
        
    def _create_timetable_notification(self, entry, action):
        title = f"Timetable {action.capitalize()}: {entry.course.name}"
        msg = f"Your class for {entry.course.name} is scheduled on {entry.get_day_display()} at {entry.time_slot} in {entry.room}."
        
        # Notify Faculty
        if entry.faculty.user:
            UserNotification.objects.create(user=entry.faculty.user, title=title, message=msg, action_url='/dashboard')
            
        # Notify Students in department/semester
        students = Student.objects.filter(department=entry.department, semester=entry.semester)
        notifications = []
        for student in students:
            if student.user:
                notifications.append(UserNotification(user=student.user, title=title, message=msg, action_url='/dashboard'))
        if notifications:
            UserNotification.objects.bulk_create(notifications)

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer

class UserNotificationViewSet(viewsets.ModelViewSet):
    queryset = UserNotification.objects.all()
    serializer_class = UserNotificationSerializer

    def get_queryset(self):
        # Allow filtering by user_id if needed, else return all
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return UserNotification.objects.filter(user_id=user_id)
        return UserNotification.objects.all()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

class UserPreferenceView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            pref, created = UserPreference.objects.get_or_create(user=user)
            serializer = UserPreferenceSerializer(pref)
            
            data = serializer.data
            if pref.profile_picture:
                data['profile_picture'] = request.build_absolute_uri(pref.profile_picture.url)
            return Response(data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            pref, created = UserPreference.objects.get_or_create(user=user)
            
            if 'theme_preference' in request.data:
                pref.theme_preference = request.data['theme_preference']
            
            if 'profile_picture' in request.FILES:
                pref.profile_picture = request.FILES['profile_picture']

            pref.save()
            serializer = UserPreferenceSerializer(pref)
            data = serializer.data
            if pref.profile_picture:
                data['profile_picture'] = request.build_absolute_uri(pref.profile_picture.url)
            return Response(data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

class DashboardStatsView(APIView):
    def get(self, request):
        student_id = request.query_params.get('student_id', None)
        if student_id:
            try:
                student = Student.objects.get(student_id=student_id)
                stats = {
                    'student_name': student.name,
                    'student_id': student.student_id,
                    'department': student.department.name,
                    'semester': student.semester,
                    'gpa': student.gpa,
                    'attendance': student.attendance,
                    'fee_status': FeeSerializer(Fee.objects.filter(student=student), many=True).data,
                    'timetable': TimetableEntrySerializer(TimetableEntry.objects.filter(department=student.department, semester=student.semester, day=timezone.now().strftime('%a').upper()), many=True).data,
                    'recent_notices': NoticeSerializer(Notice.objects.filter(is_active=True).order_by('-created_at')[:5], many=True).data
                }
                return Response(stats)
            except Student.DoesNotExist:
                return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        dept_perf = []
        departments = Department.objects.all()
        for dept in departments:
            avg_gpa = Student.objects.filter(department=dept).aggregate(Avg('gpa'))['gpa__avg'] or 0
            dept_perf.append({
                'name': dept.code or dept.name[:5],
                'perf': round(avg_gpa * 10, 2)
            })

        stats = {
            'total_students': Student.objects.count(),
            'total_faculty': Faculty.objects.count(),
            'total_departments': departments.count(),
            'pending_requests': RegistrationRequest.objects.filter(status='PENDING').count(),
            'departmental_performance': dept_perf,
            'recent_logs': ActivityLogSerializer(ActivityLog.objects.all()[:5], many=True).data,
            'recent_notices': NoticeSerializer(Notice.objects.filter(is_active=True).order_by('-created_at')[:5], many=True).data
        }
        return Response(stats)


# ---------------------------------------------------------------------------
# Login Views
# ---------------------------------------------------------------------------

class StudentLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            try:
                student = Student.objects.get(user=user)
                pref, _ = UserPreference.objects.get_or_create(user=user)
                profile_pic = request.build_absolute_uri(pref.profile_picture.url) if pref.profile_picture else None
                return Response({
                    'id': student.id,
                    'user_id': user.id,
                    'student_id': student.student_id,
                    'name': student.name,
                    'department': student.department.name,
                    'semester': student.semester,
                    'role': 'Student',
                    'theme': pref.theme_preference,
                    'profile_picture': profile_pic
                })
            except Student.DoesNotExist:
                return Response({'error': 'Not a student account'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class FacultyLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            try:
                faculty = Faculty.objects.get(user=user)
                
                # Determine if this faculty is an HOD
                is_hod = False
                if faculty.department.hod == faculty.name:
                    is_hod = True

                pref, _ = UserPreference.objects.get_or_create(user=user)
                profile_pic = request.build_absolute_uri(pref.profile_picture.url) if pref.profile_picture else None

                return Response({
                    'id': faculty.id,
                    'user_id': user.id,
                    'faculty_id': faculty.faculty_id,
                    'name': faculty.name,
                    'email': faculty.email,
                    'department': faculty.department.name,
                    'designation': faculty.designation,
                    'role': 'Faculty',
                    'is_hod': is_hod,
                    'theme': pref.theme_preference,
                    'profile_picture': profile_pic
                })
            except Faculty.DoesNotExist:
                return Response({'error': 'Not a faculty account'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Forgot Password Flow
# ---------------------------------------------------------------------------

class ForgotPasswordRequestView(APIView):
    """Step 1: Request OTP — validates email exists in User table, sends OTP."""
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user with this email exists
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Return success anyway to prevent email enumeration
            return Response({'message': 'If this email is registered, an OTP has been sent.'})

        # Invalidate previous OTPs for this email
        OTPRecord.objects.filter(email=email, is_verified=False).delete()

        # Generate and save new OTP
        otp = OTPRecord.generate_otp()
        OTPRecord.objects.create(email=email, otp=otp)

        # Send OTP email
        try:
            send_mail(
                subject='College ERP - Password Reset OTP',
                message=f"""Hello {user.first_name or user.username},

Your OTP for password reset is: {otp}

This OTP is valid for 10 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

Regards,
College ERP Team""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent to your registered email address.'})


class OTPVerifyView(APIView):
    """Step 2: Verify OTP — returns a reset_token if correct."""
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        record = OTPRecord.objects.filter(email=email, is_verified=False).order_by('-created_at').first()

        if not record:
            return Response({'error': 'No OTP request found for this email'}, status=status.HTTP_400_BAD_REQUEST)

        if record.is_expired():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if record.otp != otp:
            return Response({'error': 'Invalid OTP. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark as verified and issue reset token
        reset_token = OTPRecord.generate_token()
        record.is_verified = True
        record.reset_token = reset_token
        record.save()

        return Response({'message': 'OTP verified successfully.', 'reset_token': reset_token})


class ResetPasswordView(APIView):
    """Step 3: Reset password using the token from OTPVerifyView."""
    def post(self, request):
        reset_token = request.data.get('reset_token', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not reset_token or not new_password:
            return Response({'error': 'Token and new password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)

        record = OTPRecord.objects.filter(reset_token=reset_token, is_verified=True).first()
        if not record:
            return Response({'error': 'Invalid or expired reset token'}, status=status.HTTP_400_BAD_REQUEST)

        # Token should not be older than 30 minutes
        if (timezone.now() - record.created_at).total_seconds() > 1800:
            return Response({'error': 'Reset token has expired. Please start over.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=record.email).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        # Clean up used OTP record
        record.delete()

        return Response({'message': 'Password reset successfully. You can now log in.'})


# ---------------------------------------------------------------------------
# Registration Request Flow
# ---------------------------------------------------------------------------

class RegistrationRequestView(APIView):
    """POST: Submit a new registration request. GET: Admin list all requests."""

    def get(self, request):
        """Admin: retrieve all registration requests, optionally filtered by status."""
        status_filter = request.query_params.get('status', None)
        qs = RegistrationRequest.objects.all()
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        serializer = RegistrationRequestSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Anyone: submit a new account registration request."""
        data = request.data
        role = data.get('role', '').upper()
        if role not in ['STUDENT', 'FACULTY']:
            return Response({'error': 'Role must be STUDENT or FACULTY'}, status=status.HTTP_400_BAD_REQUEST)

        required = ['full_name', 'department']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing required fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

        email = data.get('email', '').strip().lower()

        # Check for duplicate pending/approved request from same email ONLY if email is provided
        if email:
            existing = RegistrationRequest.objects.filter(email=email, status__in=['PENDING', 'APPROVED']).first()
            if existing:
                return Response({'error': 'A registration request with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        dept = Department.objects.filter(id=data.get('department')).first()
        if not dept:
            return Response({'error': 'Invalid department'}, status=status.HTTP_400_BAD_REQUEST)

        reg = RegistrationRequest(
            role=role,
            full_name=data.get('full_name'),
            email=email,
            phone=data.get('phone', ''),
            department=dept,
        )

        if role == 'STUDENT':
            reg.semester = data.get('semester')
            reg.date_of_birth = data.get('date_of_birth') or None
            reg.address = data.get('address', '')
        else:
            reg.designation = data.get('designation', '')
            reg.qualification = data.get('qualification', '')
            reg.experience_years = data.get('experience_years')

        reg.save()

        # Notify admin via email (optionally — send to DEFAULT_FROM_EMAIL as admin inbox)
        try:
            send_mail(
                subject=f'[College ERP] New {role.title()} Registration Request - {reg.full_name}',
                message=f"""A new {role.lower()} registration request has been submitted.

Name: {reg.full_name}
Email: {reg.email}
Role: {role.title()}
Department: {dept.name}
Phone: {reg.phone or 'N/A'}

Please log in to the admin panel to review and take action:
{settings.FRONTEND_URL}/admin/registration-requests

Regards,
College ERP System""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.EMAIL_HOST_USER],
                fail_silently=True,
            )
        except Exception:
            pass  # Don't fail the request if admin notification fails

        if reg.email:
            msg = f'Registration request submitted successfully. The admin will review your request and contact you at {reg.email}.'
        else:
            msg = 'Registration request submitted successfully. Please check with the administration for your account details later.'
            
        return Response({'message': msg}, status=status.HTTP_201_CREATED)


class RegistrationRequestActionView(APIView):
    """Admin: Approve or Reject a registration request."""

    def delete(self, request, pk):
        try:
            reg = RegistrationRequest.objects.get(pk=pk)
        except RegistrationRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if reg.status == 'APPROVED' and reg.generated_username:
            # Delete corresponding User if it exists (Cascades to Student/Faculty profile)
            user = User.objects.filter(username=reg.generated_username).first()
            if user:
                user.delete()
        
        reg.delete()
        return Response({'message': 'Registration request completely deleted.'}, status=status.HTTP_200_OK)

    def post(self, request, pk):
        try:
            reg = RegistrationRequest.objects.get(pk=pk)
        except RegistrationRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

        action_type = request.data.get('action', '').upper()
        if action_type not in ['APPROVE', 'REJECT']:
            return Response({'error': 'Action must be APPROVE or REJECT'}, status=status.HTTP_400_BAD_REQUEST)

        if reg.status != 'PENDING':
            return Response({'error': f'Request has already been {reg.status.lower()}'}, status=status.HTTP_400_BAD_REQUEST)

        reviewed_by = request.data.get('reviewed_by', 'Admin')
        reg.reviewed_by = reviewed_by
        reg.reviewed_at = timezone.now()

        if action_type == 'APPROVE':
            return self._approve(request, reg)
        else:
            return self._reject(request, reg)

    def _approve(self, request, reg):
        """Create Django User + Student/Faculty record, send credentials email."""
        try:
            if reg.role == 'STUDENT':
                year = timezone.now().year
                count = Student.objects.filter(student_id__startswith=f'STU{year}').count() + 1
                student_id = f"STU{year}{count:04d}"
                login_id = student_id
                id_label = 'Student ID'
                
                dob_year = reg.date_of_birth.strftime('%Y') if reg.date_of_birth else str(year)
                # User requested format: PCMKPM + doy (DOB year) + id (01, 02)
                username = f"PCMKPM{dob_year}{count:02d}"
                # Password should be Date of Birth (DDMMYYYY)
                temp_password = reg.date_of_birth.strftime('%d%m%Y') if reg.date_of_birth else "PCMKPM@123"
            else:
                dept_code = reg.department.code[:3].upper() if hasattr(reg.department, 'code') and reg.department.code else 'FAC'
                count = Faculty.objects.filter(faculty_id__startswith=f'FAC{dept_code}').count() + 1
                faculty_id = f"FAC{dept_code}{count:03d}"
                login_id = faculty_id
                id_label = 'Faculty ID'
                
                year = timezone.now().year
                username = f"PCMKPMFAC{year}{count:02d}"
                temp_password = "PCMKPM@123"

            # Ensure unique username
            base_username = username
            suffix = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{suffix}"
                suffix += 1

            # Create Django user
            user = User.objects.create_user(
                username=username,
                email=reg.email,
                password=temp_password,
                first_name=reg.full_name.split()[0],
                last_name=' '.join(reg.full_name.split()[1:]) if len(reg.full_name.split()) > 1 else ''
            )

            if reg.role == 'STUDENT':
                Student.objects.create(
                    user=user,
                    name=reg.full_name,
                    student_id=student_id,
                    department=reg.department,
                    semester=reg.semester or 1,
                )
            else:
                Faculty.objects.create(
                    user=user,
                    name=reg.full_name,
                    faculty_id=faculty_id,
                    email=reg.email,
                    phone=reg.phone or '',
                    department=reg.department,
                    designation=reg.designation or 'Lecturer',
                )

        except Exception as e:
            return Response({'error': f'Failed to create account: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        reg.status = 'APPROVED'
        reg.generated_username = username
        reg.generated_password = temp_password
        reg.save()

        ActivityLog.objects.create(
            user=reg.reviewed_by or 'System Admin',
            action=f"Approved Registration Request for {reg.full_name} ({reg.role})"
        )

        # Send approval email only if email is provided
        if reg.email:
            try:
                send_mail(
                    subject='College ERP - Your Account Has Been Approved! 🎉',
                    message=f"""Dear {reg.full_name},

Congratulations! Your registration request for College ERP has been approved.

Here are your login credentials:

  {id_label}: {login_id}
  Username: {username}
  Temporary Password: {temp_password}

Please log in at: {settings.FRONTEND_URL}/login

IMPORTANT: Please change your password after first login.

If you have any issues, please contact the admin.

Regards,
College ERP Team""",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[reg.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({
                    'message': 'Account approved but email delivery failed. Credentials saved.',
                    'warning': str(e),
                    'credentials': {'username': username, 'password': temp_password, 'id': login_id}
                })

            return Response({'message': f'Request approved. Credentials sent to {reg.email}.'})
        else:
            return Response({'message': 'Request approved successfully. Credentials saved.'})

    def _reject(self, request, reg):
        """Mark as rejected and send rejection email."""
        reason = request.data.get('reason', 'Your request did not meet the requirements.')
        reg.status = 'REJECTED'
        reg.rejection_reason = reason
        reg.save()

        ActivityLog.objects.create(
            user=reg.reviewed_by or 'System Admin',
            action=f"Rejected Registration Request for {reg.full_name} ({reg.role})"
        )

        try:
            if reg.email:
                send_mail(
                    subject='College ERP - Registration Request Update',
                    message=f"""Dear {reg.full_name},

We regret to inform you that your registration request for the College ERP system has not been approved at this time.

Reason: {reason}

If you believe this is an error, please contact the college administration directly.

Regards,
College ERP Team""",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[reg.email],
                    fail_silently=False,
                )
        except Exception as e:
            return Response({'message': 'Request rejected but rejection email failed.', 'warning': str(e)})

        msg = f'Request rejected. Notification sent to {reg.email}.' if reg.email else 'Request rejected successfully.'
        return Response({'message': msg})


# ---------------------------------------------------------------------------
# Academic Analytics View
# ---------------------------------------------------------------------------

class AcademicAnalyticsView(APIView):
    def get(self, request):
        department_id = request.query_params.get('department_id')
        semester = request.query_params.get('semester')

        if not department_id:
            return Response({'error': 'department_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department_id = int(department_id)
        except ValueError:
            return Response({'error': 'Invalid department_id'}, status=status.HTTP_400_BAD_REQUEST)

        # Filters
        students_filter = {'department_id': department_id}
        if semester:
            try:
                semester = int(semester)
                students_filter['semester'] = semester
            except ValueError:
                pass

        students = Student.objects.filter(**students_filter)
        total_students = students.count()

        if total_students == 0:
            return Response({
                'average_gpa': 0,
                'attendance_rate': 0,
                'pass_percentage': 0,
                'top_performers': 0,
                'subject_performance': {'labels': [], 'class_average': [], 'top_performer': []},
                'grade_distribution': [0, 0, 0, 0, 0, 0]
            })

        # Calculate Average GPA
        avg_gpa = students.aggregate(avg=Avg('gpa'))['avg'] or 0.0

        # Calculate Attendance Rate
        avg_attendance = students.aggregate(avg=Avg('attendance'))['avg'] or 0.0

        # Calculate Top Performers count (GPA > 9.0)
        top_performers_count = students.filter(gpa__gt=9.0).count()

        # Calculate Pass Percentage (status != 'Poor' or GPA >= 5.0)
        passed_students = students.filter(gpa__gte=5.0).count()
        pass_percentage = (passed_students / total_students) * 100 if total_students > 0 else 0

        # Grade Distribution: ['A+ (>90)', 'A (80-90)', 'B (70-80)', 'C (60-70)', 'D (50-60)', 'F (<50)']
        grade_dist = [
            students.filter(gpa__gt=9.0).count(),
            students.filter(gpa__gt=8.0, gpa__lte=9.0).count(),
            students.filter(gpa__gt=7.0, gpa__lte=8.0).count(),
            students.filter(gpa__gt=6.0, gpa__lte=7.0).count(),
            students.filter(gpa__gt=5.0, gpa__lte=6.0).count(),
            students.filter(gpa__lte=5.0).count()
        ]

        # Subject-wise Performance
        labels = []
        class_average_data = []
        top_performer_data = []

        courses = Course.objects.filter(department_id=department_id)
        for course in courses:
            attempts = ExamAttempt.objects.filter(exam__course=course, student__in=students)
            if attempts.exists():
                labels.append(course.name)
                avg_marks = attempts.aggregate(avg=Avg('marks_obtained'))['avg'] or 0.0
                max_marks_exam = attempts.first().exam.max_marks
                avg_pct = (avg_marks / max_marks_exam * 100) if max_marks_exam > 0 else 0
                class_average_data.append(round(avg_pct, 2))

                max_obt = attempts.aggregate(max_val=Max('marks_obtained'))['max_val'] or 0.0
                top_pct = (max_obt / max_marks_exam * 100) if max_marks_exam > 0 else 0
                top_performer_data.append(round(top_pct, 2))


        return Response({
            'average_gpa': round(avg_gpa, 2),
            'attendance_rate': round(avg_attendance, 2),
            'pass_percentage': round(pass_percentage, 1),
            'top_performers': top_performers_count,
            'subject_performance': {
                'labels': labels,
                'class_average': class_average_data,
                'top_performer': top_performer_data
            },
            'grade_distribution': grade_dist
        })
