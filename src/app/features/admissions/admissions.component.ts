import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { DepartmentService } from '../../core/services/department.service';
import { AuthService } from '../../core/auth.service';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-admissions',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, DropdownModule, CalendarModule, StepsModule, ToastModule, TagModule, TableModule],
    providers: [MessageService],
    templateUrl: './admissions.component.html',
    styleUrl: './admissions.component.scss'
})
export class AdmissionsComponent implements OnInit {
    items: any[] = [];
    activeIndex: number = 0;
    admissionForm: FormGroup;
    departments: any[] = [];
    activeStudents: any[] = [];
    userRole: string = '';

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private departmentService: DepartmentService,
        private messageService: MessageService,
        private authService: AuthService
    ) {
        this.admissionForm = this.fb.group({
            // Personal Info
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            dob: [null, Validators.required],
            // Academic Info
            department: [null, Validators.required],
            previousPercentage: ['', Validators.required],
            admissionDate: [new Date(), Validators.required],
            status: ['Pending']
        });
    }

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';

        if (this.userRole === 'Student') {
            this.items = [
                { label: 'Personal Info' },
                { label: 'Academic Details' },
                { label: 'Confirmation' }
            ];
            this.loadDepartments();
        } else {
            // Load applications/students for Admin and Faculty view
            this.loadApplications();
        }
    }

    loadApplications() {
        this.apiService.get<any[]>('students').subscribe(data => this.activeStudents = data);
    }

    loadDepartments() {
        this.departmentService.loadDepartments().subscribe(deps => this.departments = deps);
    }

    nextStep() {
        this.activeIndex++;
    }

    prevStep() {
        this.activeIndex--;
    }

    submitAdmission() {
        if (this.admissionForm.valid) {
            this.apiService.post('students', {
                name: this.admissionForm.value.fullName,
                student_id: 'APP' + Date.now().toString().slice(-6),
                department: this.admissionForm.value.department,
                semester: 1, // Defaulting to Semester 1 per strict serializer validation
                gpa: 0,
                attendance: 0,
                status: 'Pending'
            }).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Admission Application Submitted Successfully' });
                    this.activeIndex = 0;
                    this.admissionForm.reset();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Submission Failed' })
            });
        }
    }
}
