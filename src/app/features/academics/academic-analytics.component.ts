import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../core/services/student.service';
import { DepartmentService } from '../../core/services/department.service';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-academic-analytics',
    standalone: true,
    imports: [CommonModule, ChartModule, TableModule, ButtonModule, DropdownModule, CardModule, TagModule, FormsModule],
    templateUrl: './academic-analytics.component.html',
    styleUrl: './academic-analytics.component.scss'
})
export class AcademicAnalyticsComponent implements OnInit {
    constructor(
        private studentService: StudentService,
        private departmentService: DepartmentService,
        private apiService: ApiService
    ) { }

    radarData!: any;
    radarOptions!: any;
    barData!: any;
    barOptions!: any;
    semesters: any[] = [];
    departments: any[] = [];
    selectedSemester: any;
    selectedDept: any;
    students: Student[] = [];
    analytics: any = {
        average_gpa: 0,
        attendance_rate: 0,
        pass_percentage: 0,
        top_performers: 0
    };

    ngOnInit() {
        this.initCharts();

        this.semesters = [
            { label: 'Semester 1', value: 1 },
            { label: 'Semester 2', value: 2 },
            { label: 'Semester 3', value: 3 },
            { label: 'Semester 4', value: 4 },
        ];

        this.departmentService.loadDepartments().subscribe((deps: any[]) => {
            this.departments = deps;
            const targetDept = deps.find(d => d.name.toLowerCase().includes('msc computer science'));
            if (targetDept) {
                this.selectedDept = targetDept.id;
            }
            this.selectedSemester = 4;
            this.loadData();
        });
    }

    loadData() {
        if (!this.selectedDept || !this.selectedSemester) return;

        // Load Students for table
        this.studentService.loadStudents().subscribe(students => {
            this.students = students.filter(s => {
                const deptMatch = s.department === this.selectedDept;
                // Since our mock model might not have strict semester filtering yet, keep it flexible
                return deptMatch;
            });
        });

        // Fetch Live Analytics
        this.apiService.get<any>(`academic-analytics/?department_id=${this.selectedDept}&semester=${this.selectedSemester}`)
            .subscribe({
                next: (data) => {
                    this.analytics = {
                        average_gpa: data.average_gpa,
                        attendance_rate: data.attendance_rate,
                        pass_percentage: data.pass_percentage,
                        top_performers: data.top_performers
                    };
                    this.updateCharts(data);
                },
                error: (err) => console.error("Failed to fetch analytics", err)
            });
    }

    updateCharts(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        // Update Radar Chart (Subject-wise Performance)
        this.radarData = {
            ...this.radarData,
            labels: data.subject_performance.labels.length ? data.subject_performance.labels : ['No Data'],
            datasets: [
                {
                    ...this.radarData.datasets[0],
                    data: data.subject_performance.class_average.length ? data.subject_performance.class_average : [0]
                },
                {
                    ...this.radarData.datasets[1],
                    data: data.subject_performance.top_performer.length ? data.subject_performance.top_performer : [0]
                }
            ]
        };

        // Update Bar Chart (Grade Distribution)
        this.barData = {
            ...this.barData,
            datasets: [
                {
                    ...this.barData.datasets[0],
                    data: data.grade_distribution
                }
            ]
        };
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.radarData = {
            labels: ['Mathematics', 'Physics', 'Programming', 'Electronics', 'Communication', 'Management'],
            datasets: [
                {
                    label: 'Class Average',
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    pointBackgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    pointBorderColor: documentStyle.getPropertyValue('--blue-500'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: documentStyle.getPropertyValue('--blue-500'),
                    data: [65, 59, 90, 81, 56, 55]
                },
                {
                    label: 'Top Performer',
                    borderColor: documentStyle.getPropertyValue('--pink-500'),
                    pointBackgroundColor: documentStyle.getPropertyValue('--pink-500'),
                    pointBorderColor: documentStyle.getPropertyValue('--pink-500'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: documentStyle.getPropertyValue('--pink-500'),
                    data: [28, 48, 40, 19, 96, 27]
                }
            ]
        };

        this.radarOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                r: {
                    grid: {
                        color: surfaceBorder
                    },
                    pointLabels: {
                        color: textColorSecondary
                    }
                }
            }
        };

        this.barData = {
            labels: ['A+ (>90)', 'A (80-90)', 'B (70-80)', 'C (60-70)', 'D (50-60)', 'F (<50)'],
            datasets: [
                {
                    label: 'Student Count',
                    backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: [15, 30, 45, 20, 10, 5]
                }
            ]
        };

        this.barOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    getSeverity(status: string): "success" | "info" | "warning" | "danger" | undefined {
        // @ts-ignore
        switch (status) {
            case 'Excellent': return 'success';
            case 'Good': return 'info';
            case 'Very Good': return 'success';
            case 'Average': return 'warning';
            case 'Poor': return 'danger';
            default: return undefined;
        }
    }
}
