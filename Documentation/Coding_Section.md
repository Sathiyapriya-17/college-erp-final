# 7. CODING

This section presents an expanded collection of key implementation snippets extracted directly from the College ERP System. It demonstrates the sophisticated interaction between the PostgreSQL database, Django REST Framework backend logic, and the Angular frontend. The selected examples highlight core functionalities such as relational data modeling, dynamic API routing, automated backend computations (CGPA & Emailing), and responsive frontend state management. These implementations reflect the system’s modular, scalable, and maintainable architecture.

## 7.1. Django Database Model & Data Integrity
The following Python code defines the `Course` model using Django’s Object Relational Mapping (ORM). This model represents academic subjects and establishes deep relationships with the `Department` and `Faculty` entities, ensuring referential mapping and absolute data consistency within the PostgreSQL database.

```python
# backend/api/models.py
from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey('Department', on_delete=models.CASCADE, related_name='courses')
    semester = models.IntegerField(default=1)
    credits = models.IntegerField(default=3)
    allocated_faculty = models.ForeignKey('Faculty', on_delete=models.SET_NULL, null=True, blank=True, related_name='allocated_courses')
    version = models.CharField(max_length=20, default="1.0")
    outcomes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"
```
*The `Course` model plays a crucial role in curriculum management by storing subject details such as course name, code, credits, and semester. Foreign key relationships ensure referential integrity. Additionally, version control and outcome fields support curriculum updates and academic evaluation processes.*

## 7.2. DRF Routing Configuration
To expose the backend logic seamlessly, the system utilizes the Django REST Framework `DefaultRouter`. This completely automates the generation of RESTful endpoints based on the registered ViewSets, minimizing redundant code.

```python
# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, CourseViewSet, StudentViewSet,
    FacultyViewSet, NoticeViewSet, AttendanceViewSet, FeeViewSet,
    ExamViewSet, ExamAttemptViewSet, TimetableEntryViewSet, DashboardStatsView
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'faculty', FacultyViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'exam-attempts', ExamAttemptViewSet)
router.register(r'timetable', TimetableEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # Note: Authentication pathways removed for brevity
]
```

## 7.3. Django Backend: Bulk Attendance Submission
The following code snippet demonstrates the `AttendanceViewSet`, which provides RESTful APIs for managing attendance records. It includes a custom `@action` method specifically built for handling bulk attendance arrays efficiently, bypassing the need for looping hundreds of HTTP requests.

```python
# backend/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

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
```
*The `AttendanceViewSet` manages attendance-related operations through RESTful endpoints. The custom `bulk_create` method allows multiple attendance records to be processed in a single secure POST request, improving system efficiency. The use of `update_or_create` ensures that duplicate entries are completely avoided, structurally maintaining data persistence.*

## 7.4. Django Backend: Automated CGPA Calculation & Emailing
This excerpt exposes highly sophisticated business logic hidden inside the backend. When a faculty member inputs scores, the server not only saves the scores but computationally recalculates the student's cumulative GPA and instantly fires an email to the student through SMTP.

```python
# backend/api/views.py
    @action(detail=False, methods=['post'])
    def enter_marks(self, request):
        exam_id = request.data.get('exam')
        marks_data = request.data.get('marks', []) 
        exam = Exam.objects.filter(id=exam_id).first()
        
        updated_attempts = []
        for mark_info in marks_data:
            student_id = mark_info.get('student')
            marks = mark_info.get('marks_obtained')
            
            if student_id is not None and marks is not None:
                attempt, created = ExamAttempt.objects.get_or_create(
                    exam=exam, student_id=student_id,
                    defaults={'status': 'Graded', 'marks_obtained': marks}
                )
                
                if not created:
                    attempt.marks_obtained = marks
                    attempt.save()
                    
                # Automate CGPA Recalculation based on Exam attempts
                student = attempt.student
                all_attempts = ExamAttempt.objects.filter(student=student, status='Graded')
                if all_attempts.exists():
                    total_percentage = 0
                    for att in all_attempts:
                        if att.exam.max_marks > 0:
                            total_percentage += (att.marks_obtained / att.exam.max_marks) * 100
                    avg_percentage = total_percentage / all_attempts.count()
                    student.gpa = round(avg_percentage / 10, 2) # Render as CGPA out of 10
                    student.save()
                    
                # Dispatch Real-Time Email via SMTP
                if student.user and student.user.email:
                    try:
                        send_mail(
                            subject=f"College ERP - Marks Published for {exam.title}",
                            message=f"Dear {student.name},\nYour marks for {exam.title} have been published.\nMarks Obtained: {marks}/{exam.max_marks}",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[student.user.email],
                        )
                    except Exception:
                        pass
                        
        return Response({'status': 'Marks Processed'}, status=status.HTTP_200_OK)
```

## 7.5. Angular Frontend: Interactive Attendance Grid
The following extensive TypeScript logic powers the Attendance Recording grid. It demonstrates how Angular dynamically fetches arrays of students linked to a specific department, pre-fills existing attendance using RxJS observable streams, and compiles a comprehensive array to transmit to the backend securely.

```typescript
// src/app/features/academics/attendance/attendance-recording.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AttendanceService, Attendance } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-attendance-recording',
  standalone: true,
  templateUrl: './attendance-recording.component.html'
})
export class AttendanceRecordingComponent {
  private attendanceService = inject(AttendanceService);
  private messageService = inject(MessageService);
  
  date: Date = new Date();
  students: any[] = [];
  selectedCourse: any;

  // Render and sync UI Grid with exact backend Database state
  loadFacultyStudentsAndAttendance() {
    this.studentService.loadStudents().subscribe(allStudents => {
      this.students = allStudents
        .filter(s => s.department === this.selectedDepartment)
        .map(s => ({ id: s.id, rollNo: s.student_id, name: s.name, status: 'Present' }));

      // Fetch existing attendance to pre-fill visual toggles
      if (this.date) {
        const dateStr = this.date.toISOString().split('T')[0];
        let url = `http://localhost:8000/api/attendance/?date=${dateStr}`;
        if (this.selectedCourse) {
          url += `&course=${this.selectedCourse}`;
        }
        this.http.get<any[]>(url).subscribe(records => {
          records.forEach(rec => {
            const student = this.students.find(s => s.id === rec.student);
            if (student) {
              student.status = rec.is_present ? 'Present' : 'Absent';
            }
          });
        });
      }
    });
  }

  // Compile final array tracking properties for transmission
  saveAttendance() {
    const attendanceRecords: Attendance[] = this.students.map(s => ({
      student: s.id,
      course: this.selectedCourse || null,
      date: this.date.toISOString().split('T')[0],
      is_present: s.status === 'Present'
    }));

    // Post to Django Backend Bulk API
    this.attendanceService.markAttendance(attendanceRecords).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attendance Saved Successfully' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save attendance' })
    });
  }
}
```

## Conclusion
These comprehensive implementation examples demonstrate the highly effective, real-world integration of database, backend, and frontend logic within the College ERP System. The extensive use of the Django ORM guarantees strict structural data management, the REST APIs seamlessly automate repetitive educational computing (like CGPA generation and email dispatch), and Angular securely renders highly responsive interfaces devoid of full-page reloading. This complete decoupled architectural scope heavily enhances system performance, security, and institutional scalability.
