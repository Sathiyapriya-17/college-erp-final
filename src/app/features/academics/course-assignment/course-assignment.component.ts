import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth.service';

@Component({
    selector: 'app-course-assignment',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, DropdownModule, AvatarModule, TagModule, ProgressBarModule, ToastModule, FormsModule],
    providers: [MessageService],
    templateUrl: './course-assignment.component.html',
    styleUrl: './course-assignment.component.scss'
})
export class CourseAssignmentComponent implements OnInit {
    assignments: any[] = [];
    departments: any[] = [];
    semesters: any[] = [];
    selectedDept: any;
    selectedSem: any;

    displayDialog: boolean = false;
    selectedCourse: any;
    selectedFaculty: any;
    facultyList: any[] = [];

    displayCourseDialog: boolean = false;
    newCourse: any = { name: '', code: '', type: 'Core', credits: 3 };

    constructor(
        private messageService: MessageService,
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    get userRole() {
        return this.authService.getUserRole();
    }

    ngOnInit() {
        const user = this.authService.getUserDetails();

        this.apiService.get<any>('departments').subscribe(response => {
            const deps = response.results ? response.results : response;
            if (Array.isArray(deps)) {
                this.departments = deps.map((d: any) => ({ label: d.name, value: d.id }));
                if (user?.role === 'Faculty' && user?.department) {
                    const myDept = deps.find((d: any) => d.name === user.department);
                    if (myDept) {
                        this.selectedDept = myDept.id;
                    }
                }
            }
            this.loadCourses();
        });

        this.semesters = [
            { label: 'Semester 1', value: 1 },
            { label: 'Semester 2', value: 2 },
            { label: 'Semester 3', value: 3 },
            { label: 'Semester 4', value: 4 }
        ];
        this.selectedSem = 4;

        this.apiService.get<any>('faculty').subscribe(response => {
            const facs = response.results ? response.results : response;
            if (Array.isArray(facs)) {
                this.facultyList = facs.map((f: any) => ({ label: f.name, value: f.id }));
            }
        });

        this.loadCourses();
    }

    onFilterChange() {
        this.loadCourses();
    }

    loadCourses() {
        if (!this.selectedDept || !this.selectedSem) {
            this.assignments = [];
            return;
        }

        this.apiService.get<any>(`courses?department=${this.selectedDept}&semester=${this.selectedSem}`).subscribe(response => {
            const courses = response.results ? response.results : response;
            if (Array.isArray(courses)) {
                this.assignments = courses;
            }
        });
    }

    editAssignment(course: any) {
        this.selectedCourse = course;
        this.selectedFaculty = course.allocated_faculty;
        this.displayDialog = true;
    }

    saveAssignment() {
        if (this.selectedCourse && this.selectedFaculty) {
            this.apiService.patch(`courses/${this.selectedCourse.id}/`, {
                allocated_faculty: this.selectedFaculty
            }).subscribe({
                next: () => {
                    this.displayDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Faculty assigned successfully' });
                    this.loadCourses();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign faculty' })
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a faculty member' });
        }
    }

    getFacultyWorkload(facultyName: string): number {
        // Mock calculation
        if (!facultyName) return 0;
        return facultyName.length + 8; // Random-ish number based on name length
    }

    showAddCourse() {
        this.newCourse = { name: '', code: '', type: 'Core', credits: 3 };
        this.displayCourseDialog = true;
    }

    saveNewCourse() {
        if (!this.selectedDept || !this.selectedSem) {
            this.messageService.add({ severity: 'warn', summary: 'Filters Required', detail: 'Please select a Department and Semester to create a course in.' });
            return;
        }

        const payload = {
            ...this.newCourse,
            department: this.selectedDept,
            semester: this.selectedSem,
            allocated_faculty: null
        };

        this.apiService.post('courses', payload).subscribe({
            next: () => {
                this.displayCourseDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Course created successfully' });
                this.loadCourses();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create course' })
        });
    }
}
