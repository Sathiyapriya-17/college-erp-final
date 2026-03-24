import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AttendanceService, Attendance } from '../../../core/services/attendance.service';
import { StudentService } from '../../../core/services/student.service';
import { DepartmentService } from '../../../core/services/department.service';
import { FacultyService } from '../../../core/services/faculty.service';
import { AuthService } from '../../../core/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance-recording',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CalendarModule, DropdownModule, RadioButtonModule, InputTextModule, AvatarModule, ToastModule, FormsModule, TagModule, CardModule],
  providers: [MessageService],
  templateUrl: './attendance-recording.component.html',
  styleUrl: './attendance-recording.component.scss'
})
export class AttendanceRecordingComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private studentService = inject(StudentService);
  private facultyService = inject(FacultyService);
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  // Faculty recording state
  date: Date = new Date();
  departments: any[] = [];
  selectedDepartment: any;
  courses: any[] = [];
  selectedCourse: any;
  students: any[] = [];

  // Student view state
  myAttendance: any[] = [];
  loadingAttendance = false;
  studentCourse: any;

  get user() {
    return this.authService.getUserDetails() || { name: 'Guest', role: 'Guest' as any, student_id: '', department: '', semester: 0 };
  }

  get isStudent() {
    return this.user?.role === 'Student';
  }

  get isAdmin() {
    return this.user?.role === 'Admin';
  }

  ngOnInit() {
    if (this.isStudent) {
      this.loadCourses(); // Required for course-based attendance view
      this.loadMyAttendance();
    } else {
      this.loadDepartments();
      this.loadCourses();
    }
  }

  // ─── Student View ───────────────────────────────────────────────────────────

  loadMyAttendance() {
    this.loadingAttendance = true;
    let url = `http://localhost:8000/api/attendance/?student_id=${this.user.student_id}`;
    if (this.studentCourse) {
      url += `&course=${this.studentCourse}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (records) => {
        // Enforce unique dates only as per user request
        const unique: any[] = [];
        const seen = new Set();
        for (const r of records) {
          if (!seen.has(r.date)) {
            seen.add(r.date);
            unique.push(r);
          } else {
            const existing = unique.find(x => x.date === r.date);
            if (existing && r.course_name && !existing.course_name.includes(r.course_name)) {
              existing.course_name += ', ' + r.course_name;
            }
          }
        }
        // Sort descending
        this.myAttendance = unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.loadingAttendance = false;
      },
      error: () => {
        this.loadingAttendance = false;
      }
    });
  }

  getTotalDays() { return this.myAttendance.length; }
  getPresentDaysStudent() { return this.myAttendance.filter(r => r.is_present).length; }
  getAbsentDaysStudent() { return this.myAttendance.filter(r => !r.is_present).length; }
  getAttendancePercentageStudent() {
    if (this.myAttendance.length === 0) return 0;
    return Math.round((this.getPresentDaysStudent() / this.myAttendance.length) * 100);
  }
  getStatusSeverity(isPresent: boolean): 'success' | 'danger' {
    return isPresent ? 'success' : 'danger';
  }
  getStatusLabel(isPresent: boolean): string {
    return isPresent ? 'Present' : 'Absent';
  }

  // ─── Faculty View ────────────────────────────────────────────────────────────

  loadDepartments() {
    this.departmentService.loadDepartments().subscribe(deps => {
      this.departments = deps.map(d => ({ label: d.name, value: d.id }));
    });
  }

  loadCourses() {
    this.attendanceService.loadCourses().subscribe(courses => {
      this.courses = courses.map(c => ({ label: c.name, value: c.id }));
    });
  }

  onDepartmentChange() {
    this.loadFacultyStudentsAndAttendance();
  }

  onFiltersChange() {
    this.loadFacultyStudentsAndAttendance();
  }

  loadFacultyStudentsAndAttendance() {
    if (this.selectedDepartment) {
      if (this.isAdmin) {
        this.facultyService.loadFaculty().subscribe(allFaculty => {
          this.students = allFaculty
            .filter(f => f.department === this.selectedDepartment)
            .map(f => ({ id: f.id, rollNo: f.faculty_id, name: f.name, status: 'Present', remarks: '' }));

          if (this.date) {
            const dateStr = this.date.toISOString().split('T')[0];
            this.attendanceService.loadFacultyAttendance(dateStr, this.selectedDepartment).subscribe(records => {
              records.forEach(rec => {
                const person = this.students.find(s => s.id === rec.faculty);
                if (person) {
                  person.status = rec.is_present ? 'Present' : 'Absent';
                  person.remarks = rec.remarks || '';
                }
              });
            });
          }
        });
      } else {
        this.studentService.loadStudents().subscribe(allStudents => {
          this.students = allStudents
            .filter(s => s.department === this.selectedDepartment)
            .map(s => ({ id: s.id, rollNo: s.student_id, name: s.name, status: 'Present', remarks: '' }));

          // Fetch existing attendance to pre-fill status
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
    }
  }

  markAll(status: string) { this.students.forEach(s => s.status = status); }

  getPresentCount() { return this.students.filter(s => s.status === 'Present').length; }
  getAbsentCount() { return this.students.filter(s => s.status === 'Absent').length; }
  getAttendancePercentage() {
    if (this.students.length === 0) return 0;
    return Math.round((this.getPresentCount() / this.students.length) * 100);
  }

  saveAttendance() {
    if (!this.selectedDepartment || this.students.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a department and ensure members are loaded.' });
      return;
    }

    if (!this.isAdmin && !this.selectedCourse) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Course', detail: 'Please select a course to explicitly mark attendance against.' });
      return;
    }

    if (this.isAdmin) {
      const attendanceRecords = this.students.map(s => ({
        faculty: s.id,
        date: this.date.toISOString().split('T')[0],
        is_present: s.status === 'Present',
        remarks: s.remarks
      }));
      this.attendanceService.markFacultyAttendance(attendanceRecords).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Faculty Attendance Saved Successfully' }),
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save faculty attendance' })
      });
    } else {
      const attendanceRecords: Attendance[] = this.students.map(s => ({
        student: s.id,
        course: this.selectedCourse || null,
        date: this.date.toISOString().split('T')[0],
        is_present: s.status === 'Present'
      }));
      this.attendanceService.markAttendance(attendanceRecords).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attendance Saved Successfully' }),
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save attendance' })
      });
    }
  }
}
