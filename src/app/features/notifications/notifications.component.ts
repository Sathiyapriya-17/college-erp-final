import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, BadgeModule],
    template: `
    <div class="p-4" style="height: calc(100vh - 4rem); overflow-y: auto;">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="text-3xl font-bold m-0 text-900">Notifications</h1>
        <p-badge *ngIf="(unreadCount$ | async) as count" [value]="count.toString()" severity="danger" styleClass="text-xl px-3"></p-badge>
      </div>

      <div class="grid flex-column gap-3">
        <ng-container *ngIf="(notifications$ | async) as notifications">
          <div *ngIf="notifications.length === 0" class="col-12 text-center p-5 text-500">
            <i class="pi pi-bell-slash text-6xl mb-3"></i>
            <p class="text-xl font-medium">No completely new notifications.</p>
          </div>

          <div *ngFor="let note of notifications" class="col-12 cursor-pointer transition-colors transition-duration-150 p-3 border-round border-1"
               [ngClass]="note.is_read ? 'surface-card border-200' : 'bg-blue-50 border-blue-200'" (click)="markRead(note)">
            
            <div class="flex justify-content-between align-items-start mb-2">
              <span class="font-bold text-lg" [ngClass]="note.is_read ? 'text-700' : 'text-primary'">
                <i class="pi pr-2" [ngClass]="note.is_read ? 'pi-check-circle text-500' : 'pi-circle-fill text-blue-500'"></i>
                {{ note.title }}
              </span>
              <span class="text-sm" [ngClass]="note.is_read ? 'text-500' : 'text-blue-500'">{{ note.created_at | date:'medium' }}</span>
            </div>
            
            <p class="mt-0 mb-3 ml-4" [ngClass]="note.is_read ? 'text-600' : 'text-800 font-medium'">
              {{ note.message }}
            </p>
            
            <div *ngIf="note.action_url" class="flex justify-content-end">
               <button pButton label="View Action" icon="pi pi-arrow-right" 
                       class="p-button-sm p-button-text" 
                       severity="secondary" 
                       (click)="$event.stopPropagation(); goTo(note.action_url)">
               </button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
    notificationService = inject(NotificationService);

    notifications$: Observable<Notification[]> = this.notificationService.notifications$;
    unreadCount$: Observable<number> = this.notificationService.unreadCount$;

    ngOnInit() {
        this.notificationService.loadNotifications();
    }

    markRead(note: Notification) {
        if (!note.is_read) {
            this.notificationService.markAsRead(note.id).subscribe();
        }
    }

    goTo(url: string) {
        // Basic navigation simulation
        console.log("Navigating to: ", url);
        window.location.hash = url;
    }
}
