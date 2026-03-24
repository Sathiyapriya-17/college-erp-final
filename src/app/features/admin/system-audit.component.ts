import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';

export interface ActivityLog {
    id: number;
    user: string;
    action: string;
    timestamp: string;
    icon?: string;
    color?: string;
}

@Component({
    selector: 'app-system-audit',
    standalone: true,
    imports: [CommonModule, TableModule, CardModule, ButtonModule, TagModule, TimelineModule],
    templateUrl: './system-audit.component.html',
    styles: [`
        .custom-marker {
            display: flex;
            width: 2rem;
            height: 2rem;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            border-radius: 50%;
            z-index: 1;
        }
        ::ng-deep .p-timeline-event-content,
        ::ng-deep .p-timeline-event-opposite {
            line-height: 1;
        }
    `]
})
export class SystemAuditComponent implements OnInit {
    logs: ActivityLog[] = [];
    loading: boolean = true;
    private http = inject(HttpClient);

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs() {
        this.loading = true;
        this.http.get<ActivityLog[]>('http://localhost:8000/api/activity-logs/').subscribe({
            next: (data) => {
                this.logs = data.map(log => {
                    let icon = 'pi pi-info';
                    let color = '#3B82F6'; // blue

                    const actionLower = log.action.toLowerCase();
                    if (actionLower.includes('approve') || actionLower.includes('success') || actionLower.includes('create') || actionLower.includes('add')) {
                        icon = 'pi pi-check';
                        color = '#22C55E'; // green
                    } else if (actionLower.includes('reject') || actionLower.includes('fail') || actionLower.includes('delete') || actionLower.includes('remove')) {
                        icon = 'pi pi-times';
                        color = '#EF4444'; // red
                    } else if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('modify')) {
                        icon = 'pi pi-pencil';
                        color = '#F59E0B'; // orange
                    }

                    return { ...log, icon, color };
                });
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load system audit logs', err);
                this.loading = false;
            }
        });
    }
}
