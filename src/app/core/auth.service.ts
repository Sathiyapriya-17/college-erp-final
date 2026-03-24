import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { signal, NgZone } from '@angular/core';

export type UserRole = 'Admin' | 'Faculty' | 'Student' | null;

export interface UserProfile {
  id?: number;
  user_id?: number;
  student_id?: string;
  faculty_id?: string;
  name: string;
  email?: string;
  department: string;
  semester?: number;
  designation?: string;
  role: UserRole;
  is_hod?: boolean;
  theme?: string;
  profile_picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<UserProfile | null>(null);
  private ngZone = inject(NgZone);
  private http = inject(HttpClient);
  readonly apiUrl = 'http://localhost:8000/api';

  constructor(private router: Router) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  // ────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────
  async login(username: string, password?: string, role?: UserRole): Promise<boolean> {
    if (role === 'Student') {
      try {
        const response = await firstValueFrom(
          this.http.post<any>(`${this.apiUrl}/student-login/`, { username, password })
        );
        if (response) {
          const user: UserProfile = { ...response, role: 'Student' as UserRole };
          this.currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/dashboard']);
          return true;
        }
      } catch (error) {
        console.error('Student login failed', error);
        return false;
      }
    }

    if (role === 'Faculty') {
      try {
        const response = await firstValueFrom(
          this.http.post<any>(`${this.apiUrl}/faculty-login/`, { username, password })
        );
        if (response) {
          const user: UserProfile = { ...response, role: 'Faculty' as UserRole };
          this.currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/dashboard']);
          return true;
        }
      } catch (error) {
        console.error('Faculty login failed', error);
        return false;
      }
    }

    // Admin fallback (mock for now)
    if (role === 'Admin' && username === 'admin') {
      const user: UserProfile = { user_id: 0, name: 'Admin User', role: 'Admin', department: '', semester: 0, theme: 'lara-light-blue', profile_picture: '' };
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
      return true;
    }

    return false;
  }

  // ────────────────────────────────────────────────
  // Logout
  // ────────────────────────────────────────────────
  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.ngZone.run(() => {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    });
  }

  isLoggedIn() { return this.currentUser() !== null; }
  getUserRole() { return this.currentUser()?.role; }
  getUserDetails() { return this.currentUser(); }

  // ────────────────────────────────────────────────
  // Forgot Password / OTP Flow
  // ────────────────────────────────────────────────
  forgotPasswordRequest(email: string) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/forgot-password/`, { email }));
  }

  verifyOtp(email: string, otp: string) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/verify-otp/`, { email, otp }));
  }

  resetPassword(reset_token: string, new_password: string) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/reset-password/`, { reset_token, new_password }));
  }

  // ────────────────────────────────────────────────
  // Registration Requests (Contact Admin)
  // ────────────────────────────────────────────────
  submitRegistrationRequest(data: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/registration-requests/`, data));
  }

  getRegistrationRequests(statusFilter?: string) {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/registration-requests/${params}`));
  }

  actionRegistrationRequest(id: number, action: 'APPROVE' | 'REJECT', reason?: string, reviewed_by?: string) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/registration-requests/${id}/action/`, {
      action, reason, reviewed_by: reviewed_by || 'Admin'
    }));
  }

  deleteRegistrationRequest(id: number) {
    return firstValueFrom(this.http.delete<any>(`${this.apiUrl}/registration-requests/${id}/action/`));
  }

  // ────────────────────────────────────────────────
  // Departments (used in registration form)
  // ────────────────────────────────────────────────
  getDepartments() {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/departments/`));
  }

  updateCurrentUser(updates: Partial<UserProfile>) {
    const current = this.currentUser();
    if (current) {
      const updated = { ...current, ...updates };
      this.currentUser.set(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  }

  // ────────────────────────────────────────────────
  // User Preferences
  // ────────────────────────────────────────────────
  updatePreferences(userId: number, formData: FormData) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/user-preferences/${userId}/`, formData));
  }
}
