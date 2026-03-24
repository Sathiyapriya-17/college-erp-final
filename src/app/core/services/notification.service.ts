import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from '../auth.service';

export interface Notification {
    id: number;
    user: number;
    title: string;
    message: string;
    is_read: boolean;
    action_url: string | null;
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private api = inject(ApiService);
    private auth = inject(AuthService);

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor() { }

    loadNotifications(): void {
        const user = this.auth.getUserDetails();
        if (!user) return;

        // Fetch notifications specific to logged in user.
        // The backend views allow filtering by user_id
        this.api.get<Notification[]>(`notifications/?user_id=${user.user_id}`).subscribe({
            next: (notifications) => {
                this.notificationsSubject.next(notifications);
                const unread = notifications.filter(n => !n.is_read).length;
                this.unreadCountSubject.next(unread);
            },
            error: (err) => console.error('Error loading notifications:', err)
        });
    }

    markAsRead(notificationId: number): Observable<any> {
        return this.api.post<any>(`notifications/${notificationId}/mark_read/`, {}).pipe(
            tap(() => {
                // Update local state optimistic
                const currentData = this.notificationsSubject.value;
                const index = currentData.findIndex(n => n.id === notificationId);
                if (index > -1 && !currentData[index].is_read) {
                    currentData[index].is_read = true;
                    this.notificationsSubject.next([...currentData]);
                    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
                }
            })
        );
    }
}
