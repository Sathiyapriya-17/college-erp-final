import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { NoticeService, Notice, NoticeTargetRole, NoticePriority } from '../../core/services/notice.service';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    BadgeModule,
    TableModule
  ],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.scss'
})
export class NoticesComponent implements OnInit {
  private noticeService = inject(NoticeService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  notices = signal<Notice[]>([]);
  displayDialog = false;
  showAckDialog = false;
  acknowledgments: any[] = [];
  acknowledgedNotices: Set<number> = new Set();
  noticeForm: FormGroup;
  isEdit = false;
  selectedId?: string;

  targetRoles = [
    { label: 'All', value: 'BOTH' },
    { label: 'Students', value: 'STUDENT' },
    { label: 'Faculty', value: 'FACULTY' }
  ];

  priorities = [
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Important', value: 'IMPORTANT' }
  ];

  constructor() {
    this.noticeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      target_role: ['BOTH', Validators.required],
      priority: ['NORMAL', Validators.required],
      expiry_date: [new Date(), Validators.required],
      department: ['']
    });
  }

  ngOnInit() {
    this.refreshNotices();
  }

  get userRole() {
    return this.authService.getUserRole();
  }

  get canCreate() {
    return this.userRole === 'Admin';
  }

  refreshNotices() {
    this.noticeService.loadNotices().subscribe(notices => {
      this.notices.set(this.noticeService.getFilteredNotices());
      if (this.userRole === 'Faculty') {
        this.loadMyAcknowledgments();
      }
    });
  }

  loadMyAcknowledgments() {
    const user = this.authService.getUserDetails();
    if (!user || !user.id || this.userRole !== 'Faculty') return;
    this.apiService.get<any[]>(`notice-acknowledgments/?faculty=${user.id}`).subscribe(acks => {
      this.acknowledgedNotices = new Set(acks.map(a => a.notice));
    });
  }

  isAcknowledged(noticeId?: number): boolean {
    if (!noticeId) return false;
    return this.acknowledgedNotices.has(noticeId);
  }

  acknowledge(notice: Notice) {
    const user = this.authService.getUserDetails();
    if (!user || !user.id || !notice.id) return;
    this.noticeService.acknowledgeNotice(notice.id, user.id).subscribe(() => {
      this.acknowledgedNotices.add(notice.id!);
    });
  }

  viewAcknowledgments(notice: Notice) {
    if (!notice.id) return;
    this.noticeService.getAcknowledgments(notice.id).subscribe(acks => {
      this.acknowledgments = acks;
      this.showAckDialog = true;
    });
  }

  showCreateDialog() {
    this.isEdit = false;
    this.noticeForm.reset({ target_role: 'BOTH', priority: 'NORMAL', expiry_date: new Date() });
    this.displayDialog = true;
  }

  showEditDialog(notice: Notice) {
    if (this.userRole === 'Student') return;
    if (this.userRole === 'Faculty' && notice.created_by !== this.authService.getUserDetails()?.name) return;

    this.isEdit = true;
    this.selectedId = notice.id?.toString();
    this.noticeForm.patchValue({
      ...notice,
      expiry_date: notice.expiry_date ? new Date(notice.expiry_date) : new Date()
    });
    this.displayDialog = true;
  }

  saveNotice() {
    if (this.noticeForm.valid) {
      const formValue = this.noticeForm.value;
      const obs = (this.isEdit && this.selectedId)
        ? this.noticeService.updateNotice(this.selectedId, formValue)
        : this.noticeService.createNotice(formValue);

      obs.subscribe({
        next: () => {
          this.displayDialog = false;
          this.refreshNotices();
        }
      });
    }
  }

  deleteNotice(id: number | string | undefined) {
    if (id === undefined) return;
    this.noticeService.deleteNotice(id).subscribe(() => {
      this.refreshNotices();
    });
  }

  getPrioritySeverity(priority: string) {
    return priority === 'IMPORTANT' ? 'danger' : 'info';
  }
}
