import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface Attendance {
    id?: number;
    student: number;
    student_name?: string;
    roll_no?: string;
    course: number;
    course_name?: string;
    date: string;
    is_present: boolean;
    marked_by?: number;
}

export interface FacultyAttendance {
    id?: number;
    faculty: number;
    faculty_name?: string;
    faculty_id_display?: string;
    date: string;
    is_present: boolean;
    remarks?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AttendanceService {
    private apiService = inject(ApiService);
    private attendanceSignal = signal<Attendance[]>([]);

    attendanceRecords = this.attendanceSignal.asReadonly();

    loadAttendance(date?: string, courseId?: number): Observable<Attendance[]> {
        let params = '';
        if (date) params += `date=${date}&`;
        if (courseId) params += `course=${courseId}`;

        return this.apiService.get<Attendance[]>(`attendance?${params}`).pipe(
            tap(records => this.attendanceSignal.set(records))
        );
    }

    markAttendance(records: Attendance[]): Observable<any> {
        // Bulk marking attendance might need a custom endpoint or multiple POSTs
        // For now, we'll assume a standard POST for each or a bulk endpoint if we implement it.
        // Let's implement a loop or a bulk create in the backend later if needed.
        return this.apiService.post<any>('attendance/bulk_create', { records }).pipe(
            tap(() => this.loadAttendance().subscribe())
        );
    }

    markFacultyAttendance(records: FacultyAttendance[]): Observable<any> {
        return this.apiService.post<any>('faculty-attendance/bulk_create', { records });
    }

    loadFacultyAttendance(date?: string, departmentId?: number): Observable<FacultyAttendance[]> {
        let params = '';
        if (date) params += `date=${date}&`;
        if (departmentId) params += `department=${departmentId}`;
        return this.apiService.get<FacultyAttendance[]>(`faculty-attendance?${params}`);
    }

    updateAttendance(id: number, updates: Partial<Attendance>): Observable<Attendance> {
        return this.apiService.put<Attendance>(`attendance/${id}`, updates).pipe(
            tap(updated => {
                this.attendanceSignal.update(records =>
                    records.map(r => r.id === id ? { ...r, ...updated } : r)
                );
            })
        );
    }

    loadCourses(): Observable<any[]> {
        return this.apiService.get<any[]>('courses');
    }
}
