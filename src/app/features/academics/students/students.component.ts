import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { StudentService, Student } from '../../../core/services/student.service';
import { DepartmentService, Department } from '../../../core/services/department.service';

@Component({
    selector: 'app-students',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, DropdownModule, TagModule, ToastModule, FormsModule],
    providers: [MessageService],
    templateUrl: './students.component.html',
    styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit {
    private studentService = inject(StudentService);
    private departmentService = inject(DepartmentService);
    private messageService = inject(MessageService);

    students: Student[] = [];
    departments: Department[] = [];
    displayDialog: boolean = false;
    student: Student = this.getEmptyStudent();

    statusOptions = [
        { label: 'Excellent', value: 'Excellent' },
        { label: 'Very Good', value: 'Very Good' },
        { label: 'Good', value: 'Good' },
        { label: 'Average', value: 'Average' },
        { label: 'Poor', value: 'Poor' }
    ];

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.studentService.loadStudents().subscribe(data => this.students = data);
        this.departmentService.loadDepartments().subscribe(data => this.departments = data);
    }

    getEmptyStudent(): Student {
        return {
            name: '',
            student_id: '',
            department: 0,
            gpa: 0,
            attendance: 0,
            status: 'Good'
        };
    }

    showDialog() {
        if (this.departments.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Action Required',
                detail: 'Please add a Department first before adding students.'
            });
            return;
        }
        this.student = this.getEmptyStudent();
        this.displayDialog = true;
    }

    editStudent(student: Student) {
        this.student = { ...student };
        this.displayDialog = true;
    }

    saveStudent() {
        if (this.student.name && this.student.student_id && this.student.department) {
            // Validate GPA is not negative
            if (this.student.gpa < 0) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'GPA cannot be negative' });
                return;
            }

            const obs = this.student.id
                ? this.studentService.updateStudent(this.student.id, this.student)
                : this.studentService.createStudent(this.student);

            obs.subscribe({
                next: (res: any) => {
                    this.loadData();
                    this.displayDialog = false;
                    if (!this.student.id && res?.generated_username) {
                        this.messageService.add({ severity: 'success', summary: 'Account Created', detail: 'Student profile and login account created successfully.' });
                        alert(`Account Auto-Generated Successfully!\n\nUsername: ${res.generated_username}\nPassword: ${res.generated_password}\n\nPlease securely share these credentials with the student.`);
                    } else {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Student saved successfully' });
                    }
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err });
                }
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
        }
    }

    deleteStudent(student: Student) {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            if (student.id) {
                this.studentService.deleteStudent(student.id).subscribe({
                    next: () => {
                        this.loadData();
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Student removed successfully' });
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete student' });
                    }
                });
            }
        }
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Excellent': return 'success';
            case 'Very Good': return 'success';
            case 'Good': return 'info';
            case 'Average': return 'warning';
            case 'Poor': return 'danger';
            default: return 'info';
        }
    }
}
