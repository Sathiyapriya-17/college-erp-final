from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, CourseViewSet, StudentViewSet,
    FacultyViewSet, NoticeViewSet, AttendanceViewSet, FeeViewSet,
    ExamViewSet, ExamAttemptViewSet, TimetableEntryViewSet, ActivityLogViewSet,
    DashboardStatsView, StudentLoginView, FacultyLoginView,
    ForgotPasswordRequestView, OTPVerifyView, ResetPasswordView,
    RegistrationRequestView, RegistrationRequestActionView,
    FacultyAttendanceViewSet, AcademicAnalyticsView, UserNotificationViewSet,
    UserPreferenceView, NoticeAcknowledgmentViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'faculty', FacultyViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'notice-acknowledgments', NoticeAcknowledgmentViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'faculty-attendance', FacultyAttendanceViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'exam-attempts', ExamAttemptViewSet)
router.register(r'timetable', TimetableEntryViewSet)
router.register(r'activity-logs', ActivityLogViewSet)
router.register(r'notifications', UserNotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),

    # Dashboard
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('academic-analytics/', AcademicAnalyticsView.as_view(), name='academic-analytics'),

    # Login endpoints
    path('student-login/', StudentLoginView.as_view(), name='student-login'),
    path('faculty-login/', FacultyLoginView.as_view(), name='faculty-login'),

    # Forgot Password / OTP flow
    path('forgot-password/', ForgotPasswordRequestView.as_view(), name='forgot-password'),
    path('verify-otp/', OTPVerifyView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # Registration Requests (Contact Admin)
    path('registration-requests/', RegistrationRequestView.as_view(), name='registration-requests'),
    path('registration-requests/<int:pk>/action/', RegistrationRequestActionView.as_view(), name='registration-request-action'),

    # User Preferences
    path('user-preferences/<int:user_id>/', UserPreferenceView.as_view(), name='user-preferences'),
]
