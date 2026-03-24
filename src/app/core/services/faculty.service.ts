import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface Faculty {
    id?: number;
    name: string;
    faculty_id: string;
    email: string;
    phone: string;
    department: number;
    department_name?: string;
    designation: string;
    joining_date?: string;
}

@Injectable({
    providedIn: 'root'
})
export class FacultyService {
    private apiService = inject(ApiService);
    private facultySignal = signal<Faculty[]>([]);

    faculty = this.facultySignal.asReadonly();

    loadFaculty(): Observable<Faculty[]> {
        return this.apiService.get<Faculty[]>('faculty').pipe(
            tap(faculty => this.facultySignal.set(faculty))
        );
    }

    createFaculty(faculty: Faculty): Observable<Faculty> {
        return this.apiService.post<Faculty>('faculty', faculty).pipe(
            tap(newFaculty => {
                this.facultySignal.update(list => [...list, newFaculty]);
            })
        );
    }

    updateFaculty(id: number, faculty: Faculty): Observable<Faculty> {
        return this.apiService.put<Faculty>(`faculty/${id}`, faculty).pipe(
            tap(updated => {
                this.facultySignal.update(list => list.map(f => f.id === id ? updated : f));
            })
        );
    }

    deleteFaculty(id: number): Observable<any> {
        return this.apiService.delete(`faculty/${id}`).pipe(
            tap(() => {
                this.facultySignal.update(list => list.filter(f => f.id !== id));
            })
        );
    }
}
