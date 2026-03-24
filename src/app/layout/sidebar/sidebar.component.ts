import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  get user() {
    const u = this.authService.getUserDetails();
    return u?.role ? u : { name: 'Guest', role: 'Guest' as any, student_id: '', department: '', semester: 0 };
  }

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-microsoft', route: '/dashboard' },
    {
      label: 'Academics',
      icon: 'pi pi-book',
      expanded: false,
      children: [
        { label: 'Analytics', icon: 'pi pi-chart-bar', route: '/academics/analytics' },
        { label: 'Student Management', icon: 'pi pi-users', route: '/academics/students' },
        { label: 'Timetable', icon: 'pi pi-calendar', route: '/academics/timetable' },
        { label: 'Curriculum', icon: 'pi pi-sitemap', route: '/academics/curriculum' },
        { label: 'Faculty Allocation', icon: 'pi pi-users', route: '/academics/course-assignment' },
        { label: 'Attendance', icon: 'pi pi-check-circle', route: '/academics/attendance' },
        { label: 'My Attendance', icon: 'pi pi-calendar-times', route: '/academics/my-attendance' },
      ]
    },
    { label: 'Admissions', icon: 'pi pi-user-plus', route: '/admissions' },
    { label: 'Notices', icon: 'pi pi-megaphone', route: '/notices' },
    { label: 'Examinations', icon: 'pi pi-file-edit', route: '/examinations' },
    {
      label: 'Administration',
      icon: 'pi pi-cog',
      expanded: false,
      adminOnly: true,
      children: [
        { label: 'Departments', icon: 'pi pi-building', route: '/admin/departments' },
        { label: 'Faculty Management', icon: 'pi pi-id-card', route: '/faculty-management' },
        { label: 'Registration Requests', icon: 'pi pi-user-plus', route: '/admin/registration-requests', badge: true },
        { label: 'System Audit Logs', icon: 'pi pi-history', route: '/admin/system-audit' },
      ]
    }
  ];



  get filteredMenuItems() {
    const role = this.user.role;
    if (role === 'Admin') {
      return this.menuItems.filter(item => {
        if (item.label === 'Admissions') return false;

        if (item.label === 'Academics' && item.children) {
          item.children = item.children.filter(c => !['Timetable', 'My Attendance'].includes(c.label));
        }
        return true;
      });
    }

    return this.menuItems.filter(item => {
      if ((item as any).adminOnly) return false;
      if (item.label === 'Dashboard') return true;
      if (item.label === 'Notices') return true;
      if (item.label === 'Academics') {
        if (role === 'Student') {
          item.children = item.children?.filter(c =>
            ['Attendance', 'Timetable', 'Curriculum'].includes(c.label)
          );
        } else if (role === 'Faculty') {
          item.children = item.children?.filter(c =>
            ['Analytics', 'Student Management', 'Timetable', 'Curriculum', 'Faculty Allocation', 'Attendance', 'My Attendance'].includes(c.label)
          );
        } else {
           item.children = item.children?.filter(c => c.label !== 'My Attendance');
        }
        return true;
      }

      if (role === 'Student') {
        return ['Admissions', 'Examinations'].includes(item.label);
      }

      if (role === 'Faculty') {
        return ['Admissions', 'Examinations', 'Academics'].includes(item.label);
      }

      return false;
    });
  }


  constructor() {
    // Auto expand 'Academics' if on an academics route
    const currentRoute = window.location.pathname;
    const academicsItem = this.menuItems.find(i => i.label === 'Academics');
    if (academicsItem && currentRoute.includes('/academics')) {
      academicsItem.expanded = true;
    }
  }

  toggleSubmenu(item: any) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }
}
