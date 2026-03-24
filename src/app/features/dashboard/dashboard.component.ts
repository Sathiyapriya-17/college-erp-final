import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ChartModule, TimelineModule, ButtonModule, MenuModule, AvatarModule, BadgeModule, TableModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    apiService = inject(ApiService);
    authService = inject(AuthService);
    router = inject(Router);

    // Role-specific data
    studentData: any;
    facultyData: any;
    adminData: any;

    chartData: any;
    chartOptions: any;

    get user() {
        return this.authService.getUserDetails() || { id: 0, name: 'Guest', role: 'Guest' as any, student_id: '', department: '', semester: 0 };
    }

    ngOnInit() {
        this.loadDashboardData();
        this.initChart();
    }

    loadDashboardData() {
        this.initRoleData(); // Load mock defaults first

        if (this.user?.role === 'Student') {
            this.apiService.get<any>(`dashboard-stats/?student_id=${this.user.student_id}`).subscribe({
                next: (data) => {
                    this.studentData = {
                        profile: {
                            id: data.student_id,
                            dept: data.department,
                            semester: data.semester + 'th',
                            name: data.student_name
                        },
                        attendance: {
                            overall: data.attendance,
                            subjects: [
                                { name: 'Data Structures', pct: 92 },
                                { name: 'Algorithms', pct: 85 },
                                { name: 'Database Systems', pct: 72, alert: true }
                            ]
                        },
                        performance: { gpa: data.gpa, cgpa: 8.2, recentResult: 'Distinction' },
                        fees: {
                            total: data.fee_status[0]?.amount || 45000,
                            paid: data.fee_status[0]?.is_paid ? data.fee_status[0]?.amount : 0,
                            due: data.fee_status[0]?.is_paid ? 0 : data.fee_status[0]?.amount,
                            status: data.fee_status[0]?.is_paid ? 'Paid' : 'Pending'
                        },
                        timetable: data.timetable.map((entry: any) => ({
                            time: entry.time_slot,
                            subject: entry.course_name,
                            room: entry.room,
                            faculty: entry.faculty_name
                        })),
                        notices: data.recent_notices.map((notice: any) => ({
                            title: notice.title,
                            date: new Date(notice.created_at).toLocaleDateString(),
                            priority: notice.priority
                        }))
                    };
                },
                error: (err) => console.error('Error loading student dashboard:', err)
            });
        }
        // Fetch live stats for Admin
        else if (this.user?.role === 'Admin' || !this.user?.role) {
            this.adminData = { stats: [], recentLogs: [] };
            this.apiService.get<any>('dashboard-stats').subscribe({
                next: (data) => {
                    this.adminData.stats = [
                        { label: 'Total Students', value: data.total_students?.toLocaleString() || '0', icon: 'pi pi-users', color: 'blue' },
                        { label: 'Total Faculty', value: data.total_faculty?.toLocaleString() || '0', icon: 'pi pi-briefcase', color: 'purple' },
                        { label: 'Total Departments', value: data.total_departments?.toLocaleString() || '0', icon: 'pi pi-building', color: 'green' }
                    ];
                    if (data.recent_logs) {
                        this.adminData.recentLogs = data.recent_logs.map((log: any) => ({
                            user: log.user || 'System',
                            action: log.action || 'Action logged',
                            time: new Date(log.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }));
                    }
                    if (data.departmental_performance) {
                        this.chartData = {
                            labels: data.departmental_performance.map((dp: any) => dp.name),
                            datasets: [{
                                label: 'Average GPA (%)',
                                data: data.departmental_performance.map((dp: any) => dp.perf),
                                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A']
                            }]
                        };
                    }
                },
                error: (err) => console.error('Error loading dashboard stats:', err)
            });
        }
    }

    initRoleData() {
        // ... (rest of the mock data stays as fallback)
        const role = this.user?.role;

        if (role === 'Student') {
            this.studentData = {
                profile: { id: 'STU2024001', dept: 'Computer Science', semester: '4th', course: 'B.Tech CS' },
                attendance: {
                    overall: 88, subjects: [
                        { name: 'Data Structures', pct: 92 },
                        { name: 'Algorithms', pct: 85 },
                        { name: 'Database Systems', pct: 72, alert: true }
                    ]
                },
                performance: { gpa: 8.4, cgpa: 8.2, recentResult: 'Distinction' },
                fees: { total: 45000, paid: 30000, due: 15000, dueDate: '2024-03-15', status: 'Pending' },
                timetable: [
                    { time: '09:00 AM', subject: 'Data Structures', room: 'LHC-102', faculty: 'Dr. Sharma' },
                    { time: '11:00 AM', subject: 'Algorithms Lab', room: 'Lab-04', faculty: 'Prof. Gupta' }
                ],
                notices: [
                    { title: 'Mid-term Exam Schedule', date: '2 days ago', priority: 'High' },
                    { title: 'Cultural Fest Registration', date: '5 days ago', priority: 'Medium' }
                ]
            };
        } else if (role === 'Faculty') {
            this.facultyData = {
                profile: { designation: 'Sr. Assistant Professor', subjects: ['Microprocessors', 'Digital Logic'], workload: 16 },
                schedule: [
                    { time: '10:00 AM', subject: 'Microprocessors', room: 'B-301', batch: 'CS-B', status: 'Ongoing' },
                    { time: '01:00 PM', subject: 'Digital Logic', room: 'C-202', batch: 'CS-A', status: 'Upcoming' }
                ],
                attendancePending: 3,
                myAttendance: 'Loading...',
                examAlerts: [
                    { msg: 'Marks entry deadline approaching (CS-B)', deadline: 'Tomorrow' },
                    { msg: 'Question paper submission', deadline: '2024-02-20' }
                ],
                studentStats: { avgPerf: 78, passPct: 92, lowPerfCount: 5 }
            };

            if (this.user?.id) {
                this.apiService.get<any[]>(`faculty-attendance/?faculty_id=${this.user.id}`).subscribe({
                    next: (records) => {
                        if (records && records.length > 0) {
                            const presentCount = records.filter(r => r.is_present).length;
                            this.facultyData.myAttendance = Math.round((presentCount / records.length) * 100) + '%';
                        } else {
                            this.facultyData.myAttendance = 'No Data';
                        }
                    },
                    error: (err) => {
                        console.error('Error fetching faculty attendance:', err);
                        this.facultyData.myAttendance = 'Error';
                    }
                });
            }
        } else {
            // Admin Data is loaded via API
            this.adminData = {
                stats: [],
                deptPerformance: [],
                recentLogs: []
            };
        }
    }

    initChart() {
        // Shared chart logic for visual appeal
        this.chartData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [
                {
                    label: 'Activity',
                    data: [65, 59, 80, 81, 56],
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: .4
                }
            ]
        };
        this.chartOptions = {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        };
    }

    navigateToActivities() {
        this.router.navigate(['/academics/analytics']);
    }
}
