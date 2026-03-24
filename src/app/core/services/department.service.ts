import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface Department {
    id?: number;
    name: string;
    code: string;
    hod?: string;
    established?: string;
    status?: string;
    facultyCount?: number;
    studentCount?: number;
}

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private apiService = inject(ApiService);
    private departmentsSignal = signal<Department[]>([]);

    departments = this.departmentsSignal.asReadonly();

    loadDepartments(): Observable<Department[]> {
        return this.apiService.get<Department[]>('departments').pipe(
            tap(deps => this.departmentsSignal.set(deps))
        );
    }

    getDepartment(id: number): Observable<Department> {
        return this.apiService.get<Department>(`departments/${id}`);
    }

    createDepartment(dept: Department): Observable<Department> {
        return this.apiService.post<Department>('departments', dept).pipe(
            tap(newDept => {
                this.departmentsSignal.update(deps => [...deps, newDept]);
            })
        );
    }

    updateDepartment(id: number, dept: Partial<Department>): Observable<Department> {
        return this.apiService.put<Department>(`departments/${id}`, dept).pipe(
            tap(updated => {
                this.departmentsSignal.update(deps =>
                    deps.map(d => d.id === id ? { ...d, ...updated } : d)
                );
            })
        );
    }

    deleteDepartment(id: number): Observable<any> {
        return this.apiService.delete(`departments/${id}`).pipe(
            tap(() => {
                this.departmentsSignal.update(deps => deps.filter(d => d.id !== id));
            })
        );
    }
}
