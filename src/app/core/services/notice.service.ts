import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap, map } from 'rxjs';
import { AuthService } from '../auth.service';

export type NoticeTargetRole = 'STUDENT' | 'FACULTY' | 'BOTH';
export type NoticePriority = 'NORMAL' | 'IMPORTANT';

export interface Notice {
  id?: number;
  title: string;
  description: string;
  created_by?: string;
  created_by_role?: string;
  target_role: NoticeTargetRole;
  department?: string;
  priority: NoticePriority;
  created_at?: Date;
  expiry_date?: Date;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private noticesSignal = signal<Notice[]>([]);

  notices = this.noticesSignal.asReadonly();

  loadNotices(): Observable<Notice[]> {
    return this.apiService.get<Notice[]>('notices').pipe(
      tap(notices => this.noticesSignal.set(notices))
    );
  }

  getFilteredNotices(): Notice[] {
    const user = this.authService.getUserDetails();
    const role = user?.role;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.noticesSignal().filter(notice => {
      // Basic visibility
      if (!notice.is_active) return false;

      // Admin sees everything
      if (role === 'Admin') return true;

      // Expiry check
      if (notice.expiry_date) {
        const expiry = new Date(notice.expiry_date);
        if (expiry < today) return false;
      }

      // Role check
      if (role === 'Student') {
        return notice.target_role === 'STUDENT' || notice.target_role === 'BOTH';
      }

      if (role === 'Faculty') {
        return notice.target_role === 'FACULTY' || notice.target_role === 'BOTH';
      }

      return false;
    });
  }

  createNotice(notice: Partial<Notice>): Observable<Notice> {
    return this.apiService.post<Notice>('notices', notice).pipe(
      tap(() => this.loadNotices().subscribe())
    );
  }

  updateNotice(id: number | string, updates: Partial<Notice>): Observable<Notice> {
    return this.apiService.put<Notice>(`notices/${id}`, updates).pipe(
      tap(() => this.loadNotices().subscribe())
    );
  }

  deleteNotice(id: number | string): Observable<any> {
    return this.apiService.delete(`notices/${id}`).pipe(
      tap(() => this.loadNotices().subscribe())
    );
  }

  acknowledgeNotice(noticeId: number, facultyId: number): Observable<any> {
    return this.apiService.post('notice-acknowledgments/acknowledge', { notice: noticeId, faculty: facultyId });
  }

  getAcknowledgments(noticeId: number): Observable<any[]> {
    return this.apiService.get<any[]>(`notice-acknowledgments/?notice=${noticeId}`);
  }
}
