import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule, StepsModule, PasswordModule, MessageModule],
    template: `
    <p-dialog
      header="Reset Password"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{width: '480px'}"
      [draggable]="false"
      styleClass="forgot-pwd-dialog"
      (onHide)="onClose()">

      <!-- Step Indicator -->
      <div class="step-indicator mb-4">
        <div class="flex gap-2 align-items-center justify-content-center">
          <div *ngFor="let s of steps; let i = index"
               class="step-dot flex align-items-center gap-2">
            <div class="dot" [class.active]="currentStep === i" [class.done]="currentStep > i">
              <span *ngIf="currentStep <= i">{{ i + 1 }}</span>
              <i *ngIf="currentStep > i" class="pi pi-check"></i>
            </div>
            <span class="step-label" [class.active]="currentStep === i">{{ s }}</span>
            <div *ngIf="i < steps.length - 1" class="step-line"></div>
          </div>
        </div>
      </div>

      <!-- Step 1: Enter Email -->
      <div *ngIf="currentStep === 0" class="step-content">
        <p class="text-color-secondary mb-3">Enter your registered email address. We'll send you a 6-digit OTP.</p>
        <label class="block font-medium mb-2">Email Address</label>
        <input pInputText type="email" [(ngModel)]="email" placeholder="yourname@college.edu"
               class="w-full mb-3" [class.ng-invalid]="emailError" />
        <small *ngIf="emailError" class="p-error block mb-2">{{ emailError }}</small>
        <p-message *ngIf="successMsg" severity="success" [text]="successMsg" styleClass="mb-3 w-full"></p-message>
        <button pButton label="Send OTP" icon="pi pi-send" class="w-full"
                [loading]="loading" (click)="sendOtp()"></button>
      </div>

      <!-- Step 2: Enter OTP -->
      <div *ngIf="currentStep === 1" class="step-content">
        <p class="text-color-secondary mb-1">Enter the 6-digit OTP sent to <strong>{{ email }}</strong></p>
        <p class="text-sm text-color-secondary mb-3">OTP is valid for 10 minutes.</p>
        <label class="block font-medium mb-2">OTP Code</label>
        <input pInputText type="text" [(ngModel)]="otp" placeholder="e.g. 123456"
               class="w-full mb-3" maxlength="6" [class.ng-invalid]="otpError" />
        <small *ngIf="otpError" class="p-error block mb-2">{{ otpError }}</small>
        <div class="flex gap-2">
          <button pButton label="Back" icon="pi pi-arrow-left" class="p-button-outlined flex-1"
                  (click)="currentStep = 0; otp = ''; otpError = ''"></button>
          <button pButton label="Verify OTP" icon="pi pi-shield" class="flex-1"
                  [loading]="loading" (click)="verifyOtp()"></button>
        </div>
        <div class="text-center mt-3">
          <a class="text-blue-500 cursor-pointer text-sm" (click)="sendOtp()">Resend OTP</a>
        </div>
      </div>

      <!-- Step 3: New Password -->
      <div *ngIf="currentStep === 2" class="step-content">
        <p class="text-color-secondary mb-3">Set a new password for your account.</p>
        <label class="block font-medium mb-2">New Password</label>
        <p-password [(ngModel)]="newPassword" [feedback]="true" styleClass="w-full mb-3"
                    inputStyleClass="w-full" placeholder="Min. 6 characters"></p-password>
        <label class="block font-medium mb-2">Confirm Password</label>
        <input pInputText type="password" [(ngModel)]="confirmPassword" placeholder="Confirm password"
               class="w-full mb-3" [class.ng-invalid]="pwdError" />
        <small *ngIf="pwdError" class="p-error block mb-2">{{ pwdError }}</small>
        <button pButton label="Reset Password" icon="pi pi-lock" class="w-full"
                [loading]="loading" (click)="resetPassword()"></button>
      </div>

      <!-- Step 4: Success -->
      <div *ngIf="currentStep === 3" class="step-content text-center">
        <div class="success-icon mb-3">
          <i class="pi pi-check-circle text-green-500" style="font-size: 3.5rem"></i>
        </div>
        <h3 class="text-900 font-bold mb-2">Password Reset Successful!</h3>
        <p class="text-color-secondary mb-4">Your password has been updated. You can now log in with your new password.</p>
        <button pButton label="Back to Login" icon="pi pi-sign-in" class="w-full"
                (click)="closeAndReset()"></button>
      </div>
    </p-dialog>
  `,
    styles: [`
    .step-indicator { padding: 0 1rem; }
    .step-dot { display: flex; align-items: center; }
    .dot {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--surface-200); color: var(--text-color-secondary);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; transition: all 0.3s;
      flex-shrink: 0;
    }
    .dot.active { background: var(--primary-color); color: white; }
    .dot.done { background: var(--green-500); color: white; }
    .step-label { font-size: 0.78rem; white-space: nowrap; }
    .step-label.active { color: var(--primary-color); font-weight: 600; }
    .step-line { width: 30px; height: 2px; background: var(--surface-300); margin: 0 4px; }
    .step-content { min-height: 180px; }
    .success-icon { padding: 1rem 0; }
  `]
})
export class ForgotPasswordComponent {
    @Output() closed = new EventEmitter<void>();

    visible = false;
    loading = false;
    currentStep = 0;

    steps = ['Enter Email', 'Verify OTP', 'New Password'];

    // Form state
    email = '';
    otp = '';
    resetToken = '';
    newPassword = '';
    confirmPassword = '';

    // Error / success messages
    emailError = '';
    otpError = '';
    pwdError = '';
    successMsg = '';

    constructor(private authService: AuthService) { }

    open() {
        this.visible = true;
        this.reset();
    }

    onClose() { this.reset(); this.closed.emit(); }

    reset() {
        this.currentStep = 0;
        this.email = ''; this.otp = ''; this.resetToken = '';
        this.newPassword = ''; this.confirmPassword = '';
        this.emailError = ''; this.otpError = ''; this.pwdError = '';
        this.successMsg = ''; this.loading = false;
    }

    async sendOtp() {
        this.emailError = '';
        if (!this.email || !this.email.includes('@')) {
            this.emailError = 'Please enter a valid email address.';
            return;
        }
        this.loading = true;
        try {
            await this.authService.forgotPasswordRequest(this.email);
            this.successMsg = 'OTP sent! Check your email.';
            setTimeout(() => { this.successMsg = ''; this.currentStep = 1; }, 1500);
        } catch (err: any) {
            this.emailError = err?.error?.error || 'Failed to send OTP. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    async verifyOtp() {
        this.otpError = '';
        if (!this.otp || this.otp.length !== 6) {
            this.otpError = 'Please enter the 6-digit OTP.';
            return;
        }
        this.loading = true;
        try {
            const res = await this.authService.verifyOtp(this.email, this.otp);
            this.resetToken = res.reset_token;
            this.currentStep = 2;
        } catch (err: any) {
            this.otpError = err?.error?.error || 'Invalid or expired OTP.';
        } finally {
            this.loading = false;
        }
    }

    async resetPassword() {
        this.pwdError = '';
        if (!this.newPassword || this.newPassword.length < 6) {
            this.pwdError = 'Password must be at least 6 characters.';
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.pwdError = 'Passwords do not match.';
            return;
        }
        this.loading = true;
        try {
            await this.authService.resetPassword(this.resetToken, this.newPassword);
            this.currentStep = 3;
        } catch (err: any) {
            this.pwdError = err?.error?.error || 'Failed to reset password.';
        } finally {
            this.loading = false;
        }
    }

    closeAndReset() {
        this.visible = false;
        this.reset();
        this.closed.emit();
    }
}
