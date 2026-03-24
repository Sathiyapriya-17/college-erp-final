import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/auth.service';

@Component({
    selector: 'app-curriculum',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, DropdownModule, InputTextModule, FormsModule, CardModule, TagModule, ToastModule],
    providers: [MessageService],
    templateUrl: './curriculum.component.html',
    styleUrl: './curriculum.component.scss'
})
export class CurriculumComponent implements OnInit {
    curriculum: any[] = [];
    departments: any[] = [];
    selectedDept: any;

    displayDialog: boolean = false;
    newCourse: any = {};
    types: any[] = [];
    semesters: any[] = [];

    constructor(
        private messageService: MessageService,
        private apiService: ApiService,
        private departmentService: DepartmentService,
        private authService: AuthService
    ) { }

    userRole: string = '';

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';
        this.loadDepartments();
        this.loadCourses();

        this.types = [
            { label: 'Core', value: 'Core' },
            { label: 'Elective', value: 'Elective' },
            { label: 'Lab', value: 'Lab' }
        ];

        this.semesters = [
            { label: 'Semester 1', value: 1 },
            { label: 'Semester 2', value: 2 },
            { label: 'Semester 3', value: 3 },
            { label: 'Semester 4', value: 4 },
            { label: 'Semester 5', value: 5 },
            { label: 'Semester 6', value: 6 },
            { label: 'Semester 7', value: 7 },
            { label: 'Semester 8', value: 8 }
        ];
    }

    loadDepartments() {
        this.departmentService.loadDepartments().subscribe(data => this.departments = data);
    }

    loadCourses() {
        this.apiService.get<any[]>('courses').subscribe(data => this.curriculum = data);
    }

    showDialog() {
        this.newCourse = { semester: 1 };
        this.displayDialog = true;
    }

    editCourse(course: any) {
        this.newCourse = { ...course };
        this.displayDialog = true;
    }

    saveCourse() {
        if (this.newCourse.code && this.newCourse.name && this.newCourse.department) {
            const obs = this.newCourse.id
                ? this.apiService.put(`courses/${this.newCourse.id}`, this.newCourse)
                : this.apiService.post('courses', this.newCourse);

            obs.subscribe({
                next: () => {
                    this.loadCourses();
                    this.displayDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course saved successfully' });
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save course' })
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill required fields' });
        }
    }

    deleteCourse(course: any) {
        if (confirm(`Are you sure you want to delete ${course.name}?`)) {
            this.apiService.delete(`courses/${course.id}`).subscribe({
                next: () => {
                    this.loadCourses();
                    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Course removed successfully' });
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete course' })
            });
        }
    }

    getTypeSeverity(type: string): "success" | "info" | "warning" | "danger" | undefined {
        switch (type) {
            case 'Core': return 'info';
            case 'Elective': return 'warning';
            case 'Lab': return 'success';
            default: return 'info';
        }
    }
}
