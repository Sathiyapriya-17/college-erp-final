import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-registration-requests',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, TagModule,
    DialogModule, InputTextareaModule, ToastModule, TabViewModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="page-header flex align-items-center justify-content-between mb-4">
      <div>
        <h2 class="text-900 font-bold text-2xl mt-0 mb-1">Registration Requests</h2>
        <p class="text-color-secondary mt-0 mb-0">Manage student and faculty account requests</p>
      </div>
      <button pButton icon="pi pi-refresh" label="Refresh" class="p-button-outlined"
              (click)="loadRequests()"></button>
    </div>

    <!-- Stats Row -->
    <div class="flex gap-3 mb-4">
      <div class="stat-card pending">
        <div class="stat-label">Pending</div>
        <div class="stat-value">{{ counts.pending }}</div>
      </div>
      <div class="stat-card approved">
        <div class="stat-label">Approved</div>
        <div class="stat-value">{{ counts.approved }}</div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-label">Rejected</div>
        <div class="stat-value">{{ counts.rejected }}</div>
      </div>
    </div>

    <!-- Tab View -->
    <p-tabView [(activeIndex)]="activeTabIndex" (onChange)="onTabChange($event)">
      <p-tabPanel header="⏳ Pending">
        <ng-template pTemplate="content">
          <ng-container *ngTemplateOutlet="requestTable; context: { list: filtered }"></ng-container>
        </ng-template>
      </p-tabPanel>
      <p-tabPanel header="✅ Approved">
        <ng-template pTemplate="content">
          <ng-container *ngTemplateOutlet="requestTable; context: { list: filtered }"></ng-container>
        </ng-template>
      </p-tabPanel>
      <p-tabPanel header="❌ Rejected">
        <ng-template pTemplate="content">
          <ng-container *ngTemplateOutlet="requestTable; context: { list: filtered }"></ng-container>
        </ng-template>
      </p-tabPanel>
      <p-tabPanel header="📋 All">
        <ng-template pTemplate="content">
          <ng-container *ngTemplateOutlet="requestTable; context: { list: filtered }"></ng-container>
        </ng-template>
      </p-tabPanel>
    </p-tabView>

    <!-- Reusable Table Template -->
    <ng-template #requestTable let-list="list">
      <p-table [value]="list" [loading]="loading" [paginator]="true" [rows]="10"
               [rowsPerPageOptions]="[5,10,25]" styleClass="p-datatable-sm"
               [globalFilterFields]="['full_name','email','department_name','role']"
               #dt responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Email</th>
            <th>Requested On</th>
            <th>Status</th>
            <th style="width:160px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-req>
          <tr>
            <td>
              <div class="font-medium">{{ req.full_name }}</div>
              <div class="text-sm text-color-secondary">{{ req.phone }}</div>
            </td>
            <td>
              <p-tag [value]="req.role_label"
                     [severity]="req.role === 'STUDENT' ? 'info' : 'warning'"></p-tag>
            </td>
            <td>{{ req.department_name }}</td>
            <td>{{ req.email }}</td>
            <td>{{ req.created_at | date:'dd MMM yyyy, hh:mm a' }}</td>
            <td>
              <p-tag [value]="req.status_label"
                     [severity]="getStatusSeverity(req.status)"></p-tag>
            </td>
            <td>
              <div class="flex gap-2">
                <button *ngIf="req.status === 'PENDING'" pButton icon="pi pi-check" label="Approve"
                        class="p-button-success p-button-sm"
                        [loading]="actionLoading[req.id]"
                        (click)="approve(req)"></button>
                <button *ngIf="req.status === 'PENDING'" pButton icon="pi pi-times" label="Reject"
                        class="p-button-danger p-button-outlined p-button-sm"
                        (click)="openRejectDialog(req)"></button>
                <button *ngIf="req.status !== 'PENDING'" pButton icon="pi pi-eye" label="View"
                        class="p-button-text p-button-sm"
                        (click)="viewDetails(req)"></button>
                <button *ngIf="req.status !== 'PENDING'" pButton icon="pi pi-trash"
                        class="p-button-danger p-button-text p-button-sm px-2"
                        [loading]="actionLoading[req.id]"
                        (click)="deleteRequest(req)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">
              <i class="pi pi-inbox text-4xl text-color-secondary mb-2 block"></i>
              <span class="text-color-secondary">No requests found</span>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </ng-template>

    <!-- Reject Dialog -->
    <p-dialog header="Reject Request" [(visible)]="rejectDialogVisible" [modal]="true"
              [style]="{width: '420px'}" [draggable]="false">
      <div *ngIf="selectedRequest">
        <p class="text-color-secondary mb-2">Rejecting request from <strong>{{ selectedRequest.full_name }}</strong></p>
        <label class="block font-medium mb-2">Reason for Rejection *</label>
        <textarea pInputTextarea [(ngModel)]="rejectionReason" class="w-full" rows="4"
                  placeholder="Explain why this request is being rejected..."></textarea>
        <small *ngIf="!rejectionReason" class="p-error">Reason is required</small>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-text"
                (click)="rejectDialogVisible = false"></button>
        <button pButton label="Reject Request" icon="pi pi-ban" class="p-button-danger"
                [disabled]="!rejectionReason.trim()" [loading]="actionLoading[selectedRequest?.id]"
                (click)="reject()"></button>
      </ng-template>
    </p-dialog>

    <!-- View Details Dialog -->
    <p-dialog header="Request Details" [(visible)]="detailsDialogVisible" [modal]="true"
              [style]="{width: '500px'}" [draggable]="false">
      <div *ngIf="selectedRequest" class="details-grid">
        <div class="detail-row"><span class="label">Name</span><span>{{ selectedRequest.full_name }}</span></div>
        <div class="detail-row"><span class="label">Email</span><span>{{ selectedRequest.email }}</span></div>
        <div class="detail-row"><span class="label">Phone</span><span>{{ selectedRequest.phone || 'N/A' }}</span></div>
        <div class="detail-row"><span class="label">Role</span><span>{{ selectedRequest.role_label }}</span></div>
        <div class="detail-row"><span class="label">Department</span><span>{{ selectedRequest.department_name }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.role === 'STUDENT'">
          <span class="label">Semester</span><span>{{ selectedRequest.semester }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.role === 'FACULTY'">
          <span class="label">Designation</span><span>{{ selectedRequest.designation }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.role === 'FACULTY'">
          <span class="label">Qualification</span><span>{{ selectedRequest.qualification || 'N/A' }}</span></div>
        <div class="detail-row"><span class="label">Status</span>
          <p-tag [value]="selectedRequest.status_label" [severity]="getStatusSeverity(selectedRequest.status)"></p-tag>
        </div>
        <div class="detail-row" *ngIf="selectedRequest.status === 'APPROVED' && selectedRequest.generated_username">
          <span class="label">Generated Username</span><span class="font-bold text-green-600">{{ selectedRequest.generated_username }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.status === 'APPROVED' && selectedRequest.generated_password">
          <span class="label">Generated Password</span><span class="font-bold text-green-600">{{ selectedRequest.generated_password }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.rejection_reason">
          <span class="label">Rejection Reason</span><span>{{ selectedRequest.rejection_reason }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.reviewed_by">
          <span class="label">Reviewed By</span><span>{{ selectedRequest.reviewed_by }}</span></div>
        <div class="detail-row" *ngIf="selectedRequest.reviewed_at">
          <span class="label">Reviewed At</span><span>{{ selectedRequest.reviewed_at | date:'dd MMM yyyy, hh:mm a' }}</span></div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .stat-card {
      flex: 1; padding: 1rem 1.5rem; border-radius: 12px;
      border-left: 4px solid transparent;
    }
    .stat-card.pending { background: #fff3e0; border-color: #ff9800; }
    .stat-card.approved { background: #e8f5e9; border-color: #4caf50; }
    .stat-card.rejected { background: #fce4ec; border-color: #f44336; }
    .stat-label { font-size: 0.85rem; color: #666; margin-bottom: 4px; }
    .stat-value { font-size: 2rem; font-weight: 700; }
    .details-grid { display: flex; flex-direction: column; gap: 0.75rem; }
    .detail-row { display: flex; gap: 1rem; align-items: center; }
    .detail-row .label { min-width: 130px; font-weight: 600; color: #555; font-size: 0.9rem; }
  `]
})
export class RegistrationRequestsComponent implements OnInit {
  requests: any[] = [];
  filtered: any[] = [];
  loading = false;
  activeTabIndex = 0;
  actionLoading: { [id: number]: boolean } = {};
  counts = { pending: 0, approved: 0, rejected: 0 };

  // Reject dialog
  rejectDialogVisible = false;
  selectedRequest: any = null;
  rejectionReason = '';

  // Details dialog
  detailsDialogVisible = false;

  constructor(private authService: AuthService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() { this.loadRequests(); }

  async loadRequests() {
    this.loading = true;
    try {
      this.requests = await this.authService.getRegistrationRequests();
      this.counts.pending = this.requests.filter(r => r.status === 'PENDING').length;
      this.counts.approved = this.requests.filter(r => r.status === 'APPROVED').length;
      this.counts.rejected = this.requests.filter(r => r.status === 'REJECTED').length;
      this.filterRequests();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load requests' });
    } finally {
      this.loading = false;
    }
  }

  onTabChange(e: any) { this.activeTabIndex = e.index; this.filterRequests(); }

  filterRequests() {
    const map: Record<number, string | null> = { 0: 'PENDING', 1: 'APPROVED', 2: 'REJECTED', 3: null };
    const s = map[this.activeTabIndex];
    this.filtered = s ? this.requests.filter(r => r.status === s) : this.requests;
  }

  getStatusSeverity(s: string): 'success' | 'warning' | 'danger' {
    return s === 'PENDING' ? 'warning' : s === 'APPROVED' ? 'success' : 'danger';
  }

  async approve(req: any) {
    this.actionLoading[req.id] = true;
    try {
      const res = await this.authService.actionRegistrationRequest(req.id, 'APPROVE', undefined, 'Admin');
      this.messageService.add({ severity: 'success', summary: 'Approved', detail: res.message });
      await this.loadRequests();
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error || 'Approval failed' });
    } finally {
      this.actionLoading[req.id] = false;
    }
  }

  openRejectDialog(req: any) {
    this.selectedRequest = req;
    this.rejectionReason = '';
    this.rejectDialogVisible = true;
  }

  async reject() {
    if (!this.rejectionReason.trim() || !this.selectedRequest) return;
    this.actionLoading[this.selectedRequest.id] = true;
    try {
      const res = await this.authService.actionRegistrationRequest(
        this.selectedRequest.id, 'REJECT', this.rejectionReason, 'Admin'
      );
      this.rejectDialogVisible = false;
      this.messageService.add({ severity: 'info', summary: 'Rejected', detail: res.message });
      await this.loadRequests();
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error || 'Rejection failed' });
    } finally {
      this.actionLoading[this.selectedRequest.id] = false;
    }
  }

  viewDetails(req: any) {
    this.selectedRequest = req;
    this.detailsDialogVisible = true;
  }

  deleteRequest(req: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete the registration request for <b>${req.full_name}</b> and their associated account login?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        this.actionLoading[req.id] = true;
        try {
          await this.authService.deleteRegistrationRequest(req.id);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Registration request and account deleted successfully' });
          await this.loadRequests();
        } catch (err: any) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error || 'Deletion failed' });
        } finally {
          this.actionLoading[req.id] = false;
        }
      }
    });
  }
}
