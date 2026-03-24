import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule,
    DropdownModule, InputTextareaModule, InputNumberModule, CalendarModule, MessageModule
  ],
  templateUrl: './contact-admin.component.html',
  styleUrl: './contact-admin.component.scss'
})
export class ContactAdminComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  visible = false;
  loading = false;
  step = 1;
  selectedRole: 'STUDENT' | 'FACULTY' | null = null;
  departments: any[] = [];
  formError = '';

  form: any = {
    full_name: '', email: '', phone: '', department: null,
    semester: null, date_of_birth: null, address: '',
    designation: '', qualification: '', experience_years: null
  };

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getDepartments().then(depts => this.departments = depts).catch(() => { });
  }

  open() {
    this.visible = true;
    this.authService.getDepartments().then(depts => this.departments = depts).catch(() => { });
  }

  selectRole(role: 'STUDENT' | 'FACULTY') { this.selectedRole = role; }

  onClose() { this.closed.emit(); }

  async submit() {
    this.formError = '';
    if (!this.form.full_name || !this.form.department) {
      this.formError = 'Please fill in all required fields (*).';
      return;
    }
    if (this.form.email && !this.form.email.includes('@')) {
      this.formError = 'Please enter a valid email address.';
      return;
    }
    if (this.selectedRole === 'STUDENT' && !this.form.semester) {
      this.formError = 'Please enter your semester.';
      return;
    }
    if (this.selectedRole === 'FACULTY' && !this.form.designation) {
      this.formError = 'Please enter your designation.';
      return;
    }

    const payload: any = {
      role: this.selectedRole,
      full_name: this.form.full_name,
      email: this.form.email,
      phone: this.form.phone,
      department: this.form.department,
    };

    if (this.selectedRole === 'STUDENT') {
      payload.semester = this.form.semester;
      payload.address = this.form.address;
      if (this.form.date_of_birth) {
        const d = this.form.date_of_birth;
        payload.date_of_birth = d instanceof Date
          ? d.toISOString().split('T')[0]
          : d;
      }
    } else {
      payload.designation = this.form.designation;
      payload.qualification = this.form.qualification;
      payload.experience_years = this.form.experience_years;
    }

    this.loading = true;
    try {
      await this.authService.submitRegistrationRequest(payload);
      this.step = 3;
    } catch (err: any) {
      this.formError = err?.error?.error || 'Submission failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  closeAndReset() {
    this.visible = false;
    this.resetForm();
    this.closed.emit();
  }

  resetForm() {
    this.step = 1; this.selectedRole = null; this.formError = ''; this.loading = false;
    this.form = {
      full_name: '', email: '', phone: '', department: null, semester: null,
      date_of_birth: null, address: '', designation: '', qualification: '', experience_years: null
    };
  }
}
