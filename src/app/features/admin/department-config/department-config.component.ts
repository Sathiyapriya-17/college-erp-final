import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DepartmentService, Department } from '../../../core/services/department.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-department-config',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, DropdownModule, RadioButtonModule, TagModule, AvatarModule, ToastModule, FormsModule],
  providers: [MessageService],
  templateUrl: './department-config.component.html',
  styleUrl: './department-config.component.scss'
})
export class DepartmentConfigComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);
  private apiService = inject(ApiService);

  departments: Department[] = [];
  displayDialog: boolean = false;
  department: Department = { name: '', code: '' };
  facultyList: any[] = [];

  ngOnInit() {
    this.loadDepartments();
    this.loadFacultyList();
  }

  loadFacultyList() {
    this.apiService.get<any>('faculty').subscribe({
      next: (response) => {
        // Handle pagination structure if it exists
        const facultyData = response.results ? response.results : response;
        if (Array.isArray(facultyData)) {
          this.facultyList = facultyData.map((f: any) => ({
            label: `${f.name} (${f.department_name})`, // Added department context to label
            value: f.name
          }));
        } else {
          this.facultyList = [];
        }
      },
      error: (err) => {
        console.error('Failed to load faculty list for HOD selection', err);
      }
    });
  }

  loadDepartments() {
    this.departmentService.loadDepartments().subscribe({
      next: (deps) => this.departments = deps,
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load departments' })
    });
  }

  showDialog() {
    this.department = { name: '', code: '' };
    this.displayDialog = true;
  }

  editDepartment(dept: any) {
    this.department = { ...dept };
    this.displayDialog = true;
  }

  saveDepartment() {
    if (this.department.name && this.department.code) {
      const obs = this.department.id
        ? this.departmentService.updateDepartment(this.department.id, this.department)
        : this.departmentService.createDepartment(this.department);

      obs.subscribe({
        next: () => {
          this.loadDepartments();
          this.displayDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Department saved successfully' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save department' });
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill required fields' });
    }
  }

  deleteDepartment(dept: Department) {
    if (confirm(`Are you sure you want to delete ${dept.name}? This will remove all associated data.`)) {
      if (dept.id) {
        this.departmentService.deleteDepartment(dept.id).subscribe({
          next: () => {
            this.loadDepartments();
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Department removed successfully' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete department' });
          }
        });
      }
    }
  }
}
