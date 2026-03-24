import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, UserRole } from '../../../core/auth.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ContactAdminComponent } from '../contact-admin/contact-admin.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, SelectButtonModule, InputTextModule, ButtonModule,
    CheckboxModule, FormsModule, ToastModule,
    ForgotPasswordComponent, ContactAdminComponent
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild('forgotPwd') forgotPwdComponent!: ForgotPasswordComponent;
  @ViewChild('contactAdmin') contactAdminComponent!: ContactAdminComponent;

  roles: any[] = [
    { label: 'Student', value: 'Student' },
    { label: 'Faculty', value: 'Faculty' },
    { label: 'Admin', value: 'Admin' }
  ];

  selectedRole: UserRole = 'Student';
  userId: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(private authService: AuthService, private messageService: MessageService) { }

  getLabel() {
    if (this.selectedRole === 'Admin') return 'Username';
    return this.selectedRole + ' ID / Username';
  }

  async login() {
    if (!this.userId || !this.password) {
      this.messageService.add({ severity: 'error', summary: 'Missing Fields', detail: 'Please enter your credentials' });
      return;
    }

    try {
      const success = await this.authService.login(this.userId, this.password, this.selectedRole);
      if (!success) {
        this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: 'Invalid credentials for ' + this.selectedRole });
      }
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred. Please try again.' });
    }
  }

  showForgotPassword() {
    this.forgotPwdComponent.open();
  }

  showContactAdmin() {
    this.contactAdminComponent.open();
  }
}
