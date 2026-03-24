import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/auth.service';

@Component({
    selector: 'app-timetable',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, DropdownModule, InputTextModule, FormsModule, CardModule, ToastModule],
    providers: [MessageService],
    templateUrl: './timetable.component.html',
    styleUrl: './timetable.component.scss'
})
export class TimetableComponent implements OnInit {
    timetableData: any[] = [];
    // Pre-initialize 6 rows × 6 cols so template never sees undefined
    grid: any[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    departments: any[] = [];
    semesters: any[] = [];
    selectedDept: any;
    selectedSem: any;

    displayDialog: boolean = false;
    newClass: any = {};
    coursesList: any[] = [];
    facultyList: any[] = [];
    // Full names used for grid display only
    days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayCodes: string[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    timeSlots: string[] = ['02:00 PM - 02:45 PM', '02:45 PM - 03:30 PM', '03:30 PM - 04:15 PM', '04:15 PM - 04:30 PM (Break)', '04:30 PM - 05:15 PM', '05:15 PM - 06:00 PM'];

    daysDropdown: any[] = [];
    timeSlotsDropdown: any[] = [];

    constructor(
        private messageService: MessageService,
        private apiService: ApiService,
        private departmentService: DepartmentService,
        private authService: AuthService
    ) { }

    get isHod(): boolean {
        const user = this.authService.getUserDetails();
        return user?.role === 'Admin' || user?.designation === 'HOD';
    }

    get isStudent(): boolean {
        return this.authService.getUserDetails()?.role === 'Student';
    }

    ngOnInit() {
        this.semesters = [1, 2, 3, 4].map(s => ({ label: `Semester ${s}`, value: s }));
        this.daysDropdown = this.days.map(d => ({ label: d, value: d }));
        this.timeSlotsDropdown = this.timeSlots.map(t => ({ label: t, value: t }));
        this.loadDepartments();
    }

    loadDepartments() {
        this.departmentService.loadDepartments().subscribe(deps => {
            this.departments = deps.filter((d: any) => d.name === 'MSc Computer Science');
            // Auto-select dept and sem for students
            if (this.isStudent) {
                const user = this.authService.getUserDetails();
                if (user?.department) {
                    const match = deps.find((d: any) => d.name === user.department);
                    if (match) { this.selectedDept = match.id; }
                }
                if (user?.semester) { this.selectedSem = user.semester; }
                if (this.selectedDept && this.selectedSem) { this.loadTimetable(); }
            }
        });
    }

    loadTimetable() {
        if (!this.selectedDept || !this.selectedSem) return;

        this.apiService.get<any[]>(`timetable/?department=${this.selectedDept}&semester=${this.selectedSem}`).subscribe({
            next: (data) => {
                this.timetableData = data;
                this.formatGrid();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load timetable' })
        });
        
        if (this.isHod) {
            this.apiService.get<any[]>(`courses/?department=${this.selectedDept}&semester=${this.selectedSem}`).subscribe({
                next: (data) => this.coursesList = data
            });
            this.apiService.get<any[]>(`faculty/?department=${this.selectedDept}`).subscribe({
                next: (data) => this.facultyList = data
            });
        }
    }

    formatGrid() {
        // Always produce a full 7×6 grid; API returns day as 3-char code and field as time_slot
        this.grid = this.timeSlots.map(slot =>
            this.dayCodes.map(dayCode =>
                this.timetableData.find(e => e.day === dayCode && e.time_slot === slot) || null
            )
        );
    }

    showDialog(slot?: string, day?: string) {
        this.newClass = {
            start_time: slot || '',
            day: day || '',
            department: this.selectedDept,
            semester: this.selectedSem
        };
        this.displayDialog = true;
    }

    editClass(entry: any) {
        this.newClass = { ...entry };
        this.displayDialog = true;
    }

    saveClass() {
        if (this.newClass.course && this.newClass.faculty && this.newClass.day && this.newClass.start_time) {
            const obs = this.newClass.id
                ? this.apiService.put(`timetable/${this.newClass.id}`, this.newClass)
                : this.apiService.post('timetable', this.newClass);

            obs.subscribe({
                next: () => {
                    this.loadTimetable();
                    this.displayDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Class scheduled successfully' });
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to schedule class' })
            });
        }
    }

    // Drag-and-drop removed due to environment issues with @angular/cdk
    onDrop(event: any, targetSlot: string, targetDay: string) {
        // Fallback or move logic can be implemented here via buttons
    }
}
