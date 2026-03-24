import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AvatarModule, InputTextModule, ButtonModule, BadgeModule, MenuModule, TooltipModule, DialogModule, DropdownModule, ToastModule, FormsModule],
  providers: [MessageService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  messageService = inject(MessageService);
  userMenuItems: MenuItem[] | undefined;
  isDarkTheme = false;
  unreadCount = 0;

  displayPrefs = false;
  themes = [
    { label: 'Light Blue (Lara)', value: 'lara-light-blue' },
    { label: 'Dark Blue (Lara)', value: 'lara-dark-blue' },
    { label: 'Light Indigo (MDC)', value: 'mdc-light-indigo' },
    { label: 'Dark Indigo (MDC)', value: 'mdc-dark-indigo' },
  ];
  selectedTheme = 'lara-light-blue';
  selectedFile: File | null = null;
  savingPrefs = false;

  ngOnInit() {
    // If user has a saved theme from DB, use it, else use local storage or default
    const userTheme = this.user.theme;
    const savedTheme = localStorage.getItem('app-theme-name') || 'lara-light-blue';
    const activeTheme = userTheme || savedTheme;

    this.selectedTheme = activeTheme;
    this.isDarkTheme = activeTheme.includes('dark');
    this.applyTheme(activeTheme);

    // Subscribe to notification count
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    // Load notifications for the logged in user
    this.notificationService.loadNotifications();

    this.userMenuItems = [
      {
        label: 'User Menu',
        items: [
          { label: 'My Preferences', icon: 'pi pi-user-edit', command: () => this.showPreferences() },
          {
            label: 'Toggle Dark Mode',
            icon: this.isDarkTheme ? 'pi pi-sun' : 'pi pi-moon',
            command: () => this.toggleTheme()
          }
        ]
      },
      { separator: true },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          console.log('Logout menu item clicked');
          this.logout();
        }
      }
    ];
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  logout = () => {
    console.log('Logging out from HeaderComponent...');
    this.authService.logout();
  }

  get user(): typeof this.authService extends { getUserDetails: () => infer U } ? NonNullable<U> : any {
    return this.authService.getUserDetails() || { user_id: 0, name: 'Guest', role: 'Guest' as any, student_id: '', department: '', semester: 0, theme: '', profile_picture: '' };
  }

  toggleTheme = () => {
    this.isDarkTheme = !this.isDarkTheme;
    console.log('Toggling theme. New state (isDark):', this.isDarkTheme);
    const themeName = this.isDarkTheme ? 'lara-dark-blue' : 'lara-light-blue';
    this.selectedTheme = themeName;
    this.applyTheme(themeName);
    localStorage.setItem('app-theme-name', themeName);

    // Update menu items to reflect new theme state icon
    if (this.userMenuItems && this.userMenuItems[0].items) {
      this.userMenuItems[0].items[1].icon = this.isDarkTheme ? 'pi pi-sun' : 'pi pi-moon';
    }

    // Save to backend if user is logged in natively
    if (this.user.user_id) {
      const fd = new FormData();
      fd.append('theme_preference', themeName);
      this.authService.updatePreferences(this.user.user_id, fd).then(
        (res: any) => this.authService.updateCurrentUser({ theme: res.theme_preference })
      ).catch((err: any) => console.error('Failed to update theme', err));
    }
  }

  showPreferences() {
    this.selectedTheme = this.user.theme || 'lara-light-blue';
    this.selectedFile = null;
    this.displayPrefs = true;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'File size exceeds 2MB limit.' });
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  savePreferences() {
    if (!this.user.user_id) return;

    this.savingPrefs = true;
    const fd = new FormData();
    fd.append('theme_preference', this.selectedTheme);
    if (this.selectedFile) {
      fd.append('profile_picture', this.selectedFile);
    }

    this.authService.updatePreferences(this.user.user_id, fd).then(
      (res: any) => {
        this.applyTheme(res.theme_preference);
        this.isDarkTheme = res.theme_preference.includes('dark');
        localStorage.setItem('app-theme-name', res.theme_preference);

        this.authService.updateCurrentUser({
          theme: res.theme_preference,
          profile_picture: res.profile_picture
        });

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Preferences updated.' });
        this.displayPrefs = false;
        this.savingPrefs = false;
      }
    ).catch(
      (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update preferences.' });
        this.savingPrefs = false;
      }
    );
  }

  private applyTheme(themeName: string) {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      const newHref = `/themes/${themeName}/theme.css`;
      console.log('Applying theme href:', newHref);
      themeLink.href = newHref;

      // Update global class for utilities
      if (themeName.includes('dark')) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      console.error('Theme link element #app-theme not found!');
    }
  }
}
