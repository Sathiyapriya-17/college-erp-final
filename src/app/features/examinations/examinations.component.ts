import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { CalendarModule } from 'primeng/calendar';
import { StepsModule } from 'primeng/steps';

@Component({
    selector: 'app-examinations',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, DropdownModule, CalendarModule, StepsModule, ToastModule, TagModule, TableModule, DialogModule],
    providers: [MessageService],
    templateUrl: './examinations.component.html',
    styleUrl: './examinations.component.scss'
})
export class ExaminationsComponent implements OnInit {
    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private departmentService: DepartmentService,
        private messageService: MessageService
    ) { }

    userRole: string = '';
    exams: any[] = [];
    departments: any[] = [];
    courses: any[] = [];
    faculties: any[] = [];

    // For students exclusively
    completedExamIds: number[] = [];

    displayExamDialog: boolean = false;
    currentExam: any = {};

    displayLinkDialog: boolean = false;
    currentExamForLink: any = null;

    displayMarksDialog: boolean = false;
    currentExamForMarks: any = null;
    examAttempts: any[] = [];

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';
        this.loadExams();
        this.loadDepartments();
    }

    loadExams() {
        this.apiService.get<any[]>('exams').subscribe(data => {
            this.exams = data;

            // If student, load their attempts to prevent rewriting
            if (this.userRole === 'Student') {
                const userDeets = this.authService.getUserDetails();
                if (userDeets?.id) {
                    this.apiService.get<any[]>(`exam-attempts/?student=${userDeets.id}`).subscribe(attempts => {
                        this.completedExamIds = attempts.map(att => att.exam);
                    });
                }
            }
        });
    }

    loadDepartments() {
        this.departmentService.loadDepartments().subscribe(deps => this.departments = deps);
    }

    onDeptChange() {
        if (this.currentExam.department) {
            this.apiService.get<any[]>(`courses/?department=${this.currentExam.department}`).subscribe(data => this.courses = data);
            this.apiService.get<any[]>(`faculty/?department=${this.currentExam.department}`).subscribe(data => this.faculties = data);
        }
    }

    showCreateExam() {
        this.currentExam = { date: new Date().toISOString().split('T')[0] };
        this.displayExamDialog = true;
    }

    saveExam() {
        const obs = this.currentExam.id
            ? this.apiService.put(`exams/${this.currentExam.id}`, this.currentExam)
            : this.apiService.post('exams', this.currentExam);

        obs.subscribe({
            next: () => {
                this.loadExams();
                this.displayExamDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Exam scheduled successfully' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to schedule exam' })
        });
    }

    takeExam(exam: any) {
        if (exam.google_form_link) {
            window.open(exam.google_form_link, '_blank');
            this.messageService.add({ severity: 'info', summary: 'Exam Started', detail: `You are now writing ${exam.title}` });

            // Mark ExamAttempt as Started/Submitted and lock it immediately on UI
            this.completedExamIds.push(exam.id);
            this.apiService.post('exam-attempts/enter_marks', {
                exam: exam.id,
                marks: [{ student: this.authService.getUserDetails()?.id, marks_obtained: null }]
            }).subscribe();
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Link Missing', detail: `The exam link is not provided yet.` });
        }
    }

    deleteExam(exam: any) {
        if (confirm(`Delete exam ${exam.title}?`)) {
            this.apiService.delete(`exams/${exam.id}`).subscribe(() => this.loadExams());
        }
    }

    showLinkDialog(exam: any) {
        this.currentExamForLink = { ...exam };
        this.displayLinkDialog = true;
    }

    saveLink() {
        this.apiService.put(`exams/${this.currentExamForLink.id}`, this.currentExamForLink).subscribe({
            next: () => {
                this.loadExams();
                this.displayLinkDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Google Form Link saved' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save link' })
        });
    }

    showMarksDialog(exam: any) {
        this.currentExamForMarks = exam;
        this.apiService.get<any[]>(`students/?department=${exam.department}`).subscribe(students => {
            this.examAttempts = students.map(s => ({
                student: s.id,
                student_name: s.name,
                student_id: s.student_id,
                marks_obtained: null
            }));

            this.apiService.get<any[]>(`exam-attempts/?exam=${exam.id}`).subscribe(attempts => {
                attempts.forEach(att => {
                    let match = this.examAttempts.find(ea => ea.student === att.student);
                    if (match) {
                        match.marks_obtained = att.marks_obtained;
                    }
                });
                this.displayMarksDialog = true;
            });
        });
    }

    saveMarks() {
        const payload = {
            exam: this.currentExamForMarks.id,
            marks: this.examAttempts.filter(ea => ea.marks_obtained !== null && ea.marks_obtained !== '')
        };
        this.apiService.post('exam-attempts/enter_marks', payload).subscribe({
            next: () => {
                this.displayMarksDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Marks saved successfully' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save marks' })
        });
    }
}
