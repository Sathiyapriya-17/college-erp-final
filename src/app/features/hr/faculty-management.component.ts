import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FacultyService, Faculty } from '../../core/services/faculty.service';
import { DepartmentService, Department } from '../../core/services/department.service';

@Component({
    selector: 'app-faculty-management',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, InputTextModule, DialogModule, DropdownModule, ToastModule, FormsModule],
    providers: [MessageService],
    templateUrl: './faculty-management.component.html'
})
export class FacultyManagementComponent implements OnInit {
    public facultyService = inject(FacultyService);
    public departmentService = inject(DepartmentService);
    private messageService = inject(MessageService);

    facultyList = this.facultyService.faculty;
    departments: any[] = [];

    displayDialog: boolean = false;
    faculty: Faculty = this.resetFaculty();
    isEdit: boolean = false;

    ngOnInit() {
        this.facultyService.loadFaculty().subscribe();
        this.departmentService.loadDepartments().subscribe((deps: Department[]) => {
            this.departments = deps.map(d => ({ label: d.name, value: d.id }));
        });
    }

    resetFaculty(): Faculty {
        return {
            name: '',
            faculty_id: '',
            email: '',
            phone: '',
            department: 0,
            designation: ''
        };
    }

    showDialog() {
        this.faculty = this.resetFaculty();
        this.isEdit = false;
        this.displayDialog = true;
    }

    editFaculty(f: Faculty) {
        this.faculty = { ...f };
        this.isEdit = true;
        this.displayDialog = true;
    }

    saveFaculty() {
        if (this.isEdit && this.faculty.id) {
            this.facultyService.updateFaculty(this.faculty.id, this.faculty).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Faculty Updated' });
                    this.displayDialog = false;
                }
            });
        } else {
            this.facultyService.createFaculty(this.faculty).subscribe({
                next: (res: any) => {
                    this.displayDialog = false;
                    if (res?.generated_username) {
                        this.messageService.add({ severity: 'success', summary: 'Account Created', detail: 'Faculty profile and login account created successfully.' });
                        alert(`Account Auto-Generated Successfully!\n\nUsername: ${res.generated_username}\nPassword: ${res.generated_password}\n\nPlease securely share these credentials with the faculty member.`);
                    } else {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Faculty Added' });
                    }
                }
            });
        }
    }

    deleteFaculty(id: number) {
        if (confirm('Are you sure you want to delete this faculty member?')) {
            this.facultyService.deleteFaculty(id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Faculty removed' });
                }
            });
        }
    }
}
