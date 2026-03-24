import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../../core/auth.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-faculty-my-attendance',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  templateUrl: './faculty-my-attendance.component.html',
  styles: ``
})
export class FacultyMyAttendanceComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  myAttendance: any[] = [];
  loadingAttendance = false;

  get user() {
    return this.authService.getUserDetails() || { id: 0, name: 'Guest', role: 'Guest' as any };
  }

  ngOnInit() {
    this.loadMyAttendance();
  }

  loadMyAttendance() {
    if (!this.user?.id) return;
    
    this.loadingAttendance = true;
    this.apiService.get<any[]>(`faculty-attendance/?faculty_id=${this.user.id}`).subscribe({
      next: (records) => {
        // Enforce unique dates 
        const unique: any[] = [];
        const seen = new Set();
        for (const r of records) {
          if (!seen.has(r.date)) {
            seen.add(r.date);
            unique.push(r);
          }
        }
        
        // Sort descending
        this.myAttendance = unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.loadingAttendance = false;
      },
      error: (err) => {
        console.error('Error loading attendance', err);
        this.loadingAttendance = false;
      }
    });
  }

  getTotalDays() { return this.myAttendance.length; }
  getPresentDays() { return this.myAttendance.filter(r => r.is_present).length; }
  getAbsentDays() { return this.myAttendance.filter(r => !r.is_present).length; }
  getAttendancePercentage() {
    if (this.myAttendance.length === 0) return 0;
    return Math.round((this.getPresentDays() / this.myAttendance.length) * 100);
  }
  
  getStatusSeverity(isPresent: boolean): 'success' | 'danger' {
    return isPresent ? 'success' : 'danger';
  }
  getStatusLabel(isPresent: boolean): string {
    return isPresent ? 'Present' : 'Absent';
  }
}
