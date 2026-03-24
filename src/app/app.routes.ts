import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { UnderDevelopmentComponent } from './features/shared/under-development/under-development.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'academics/analytics', loadComponent: () => import('./features/academics/academic-analytics.component').then(m => m.AcademicAnalyticsComponent) },
            { path: 'academics/students', loadComponent: () => import('./features/academics/students/students.component').then(m => m.StudentsComponent) },
            { path: 'academics/timetable', loadComponent: () => import('./features/academics/timetable/timetable.component').then(m => m.TimetableComponent) },
            { path: 'academics/curriculum', loadComponent: () => import('./features/academics/curriculum/curriculum.component').then(m => m.CurriculumComponent) },
            { path: 'academics/course-assignment', loadComponent: () => import('./features/academics/course-assignment/course-assignment.component').then(m => m.CourseAssignmentComponent) },
            { path: 'academics/attendance', loadComponent: () => import('./features/academics/attendance/attendance-recording.component').then(m => m.AttendanceRecordingComponent) },
            { path: 'academics/my-attendance', loadComponent: () => import('./features/academics/attendance/faculty-my-attendance/faculty-my-attendance.component').then(m => m.FacultyMyAttendanceComponent) },

            // Under Development Modules
            { path: 'admissions', loadComponent: () => import('./features/admissions/admissions.component').then(m => m.AdmissionsComponent) },
            { path: 'finance', component: UnderDevelopmentComponent, data: { moduleName: 'Finance' } },
            { path: 'notices', loadComponent: () => import('./features/notices/notices.component').then(m => m.NoticesComponent) },
            { path: 'examinations', loadComponent: () => import('./features/examinations/examinations.component').then(m => m.ExaminationsComponent) },
            { path: 'faculty-management', loadComponent: () => import('./features/hr/faculty-management.component').then(m => m.FacultyManagementComponent) },
            { path: 'library', component: UnderDevelopmentComponent, data: { moduleName: 'Library' } },
            { path: 'hostel', component: UnderDevelopmentComponent, data: { moduleName: 'Hostel' } },
            { path: 'transport', component: UnderDevelopmentComponent, data: { moduleName: 'Transport' } },
            { path: 'admin/departments', loadComponent: () => import('./features/admin/department-config/department-config.component').then(m => m.DepartmentConfigComponent) },
            { path: 'admin/registration-requests', loadComponent: () => import('./features/admin/registration-requests/registration-requests.component').then(m => m.RegistrationRequestsComponent) },
            { path: 'admin/system-audit', loadComponent: () => import('./features/admin/system-audit.component').then(m => m.SystemAuditComponent) },
            { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },

            { path: 'settings', redirectTo: 'dashboard' }
        ]
    }
];
