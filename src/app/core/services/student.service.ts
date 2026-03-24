import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { DepartmentService } from './department.service';
import { Observable, tap, switchMap, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Student {
    id?: number;
    name: string;
    student_id: string;
    department: number;
    department_name?: string;
    gpa: number;
    attendance: number;
    status: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Poor';
}

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private apiService = inject(ApiService);
    private departmentService = inject(DepartmentService);
    private studentsSignal = signal<Student[]>([]);

    students = this.studentsSignal.asReadonly();

    loadStudents(): Observable<Student[]> {
        return this.apiService.get<Student[]>('students').pipe(
            tap(students => this.studentsSignal.set(students))
        );
    }

    createStudent(student: Student): Observable<Student> {
        // First verify if any departments exist
        return this.departmentService.loadDepartments().pipe(
            switchMap(deps => {
                if (deps.length === 0) {
                    return throwError(() => 'No departments found. Please create a department first before adding students.');
                }

                // Check if the specific department ID exists
                const deptExists = deps.find(d => d.id === student.department);
                if (!deptExists) {
                    return throwError(() => `Department with ID ${student.department} does not exist. Please create it first.`);
                }

                return this.apiService.post<Student>('students', student);
            }),
            tap(newStudent => {
                this.studentsSignal.update(students => [...students, newStudent]);
            }),
            catchError(err => {
                console.error('Error creating student:', err);
                return throwError(() => err);
            })
        );
    }

    updateStudent(id: number, student: Partial<Student>): Observable<Student> {
        return this.apiService.put<Student>(`students/${id}`, student).pipe(
            tap(updated => {
                this.studentsSignal.update(students =>
                    students.map(s => s.id === id ? { ...s, ...updated } : s)
                );
            })
        );
    }

    deleteStudent(id: number): Observable<any> {
        return this.apiService.delete(`students/${id}`).pipe(
            tap(() => {
                this.studentsSignal.update(students => students.filter(s => s.id !== id));
            })
        );
    }
}
