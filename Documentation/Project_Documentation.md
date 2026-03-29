# College ERP System - Project Documentation

## 1. Introduction
This document provides a comprehensive overview of the current state of the College ERP system. It outlines the modules, features, and technical components that have been completed across the backend APIs and frontend user interfaces.

The system is built with a decoupled architecture utilizing **Django REST Framework** for the backend backend and **Angular** for the frontend client.

---

## 2. Backend Architecture & APIs (Django)
The backend provides a robust and secure set of RESTful APIs to manage the institution's data.

### 2.1. Authentication & Security
- **Student Login (`/api/student-login/`)**: Secure authentication tailored for student accounts.
- **Faculty/Admin Login (`/api/faculty-login/`)**: Secure authentication for staff and administrators.
- **Registration Requests**: 
  - `/api/registration-requests/`: Endpoint for new users to request access.
  - `/api/registration-requests/<id>/action/`: Admin endpoints to approve or reject registration requests (automatically provisions accounts and sends credentials via email).
- **Password Management**:
  - `/api/forgot-password/`: Issue OTP for forgotten passwords.
  - `/api/verify-otp/`: Verify the OTP sent to user email.
  - `/api/reset-password/`: Securely reset user password.

### 2.2. Core Academic Modules
- **Departments (`/api/departments/`)**: CRUD operations for university departments.
- **Courses (`/api/courses/`)**: Management of academic programs/courses.
- **Curriculum & Subjects**: Managing subjects aligned to various courses.

### 2.3. User Management
- **Students (`/api/students/`)**: Complete profile management, onboarding, and tracking of students. Format-specific username generation (PCMKPM + Year + ID).
- **Faculty & HR (`/api/faculty/`)**: Faculty profile management, allowing administrators to directly create faculty accounts.

### 2.4. Academic Activities
- **Timetable (`/api/timetable/`)**: Complex scheduling endpoints allowing generation and retrieval of timetables for different classes/sections. Differentiated views for faculty (editable) and students (read-only).
- **Attendance**:
  - `/api/attendance/`: Student attendance recording and metric retrieval.
  - `/api/faculty-attendance/`: Faculty attendance tracking.
- **Examinations & Grading**:
  - `/api/exams/`: Examination scheduling, including integration with Google Forms for question papers, calendar alerts, and email notifications.
  - `/api/exam-attempts/`: Faculty endpoints to enter and manage student marks line-by-line, triggering automatic CGPA recalculation.

### 2.5. Administrative Features
- **Notices & Announcements (`/api/notices/`)**: System-wide or targeted bulletin board.
- **Fees Management (`/api/fees/`)**: Tracking of student fee payments and dues.
- **Activity Logs (`/api/activity-logs/`)**: Audit trails for system security and administrative tracking.

### 2.6. Reporting & Analytics
- **Dashboard Stats (`/api/dashboard-stats/`)**: Aggregated metrics for the home dashboard.
- **Academic Analytics (`/api/academic-analytics/`)**: Comprehensive data visualization endpoints for institutional performance.

---

## 3. Frontend Application (Angular)
The frontend is a responsive, modern web application providing tailored experiences for Students, Faculty, and Administrators. Features a localized UI (Indian Rupees contextualization) and dark mode capabilities.

### 3.1. General Interface
- **Layout & Navigation**: Role-based sidebar and top navigation.
- **Dashboard**: Role-specific dashboards presenting relevant statistical cards and timely alerts.

### 3.2. Authentication Module
- **Login Component**: Unified, branded login portal handling both Student and Faculty/Admin roles.

### 3.3. Academics Module
- **Academic Analytics**: Data visualization charts monitoring attendance, performance, and enrollment.
- **Students Directory**: Interface to manage student records and histories.
- **Curriculum Builder**: Management of syllabus and course structures.
- **Course Assignment**: Allocating faculty to specific subjects and classes.
- **Attendance Recording**: Specialized grid layout allowing faculty to efficiently mark daily attendance.
- **Timetable Configurator**: Interactive graphical interface for timetable management with drag-and-drop or form-based "add class" features.

### 3.4. Examinations Module
- **Examination Management**: Interface for HODs and examination branch to schedule exams.
- **Marks Entry**: Specialized views for faculty to securely input student grades post-examination.

### 3.5. Administration Module
- **Department Configuration**: Settings to add/modify institutional departments.
- **Registration Requests Approval**: Admin portal to review pending student/staff sign-ups, generating predictable credentials (username formats, DOB-based passwords).
- **Faculty Management (HR)**: Interface moved under administration for comprehensive staff oversight.
- **System Audit**: Interface to review the activity logs and ensure system integrity.

### 3.6. Additional Integrated Modules
- **Notices**: Publishing and viewing institutional announcements.
- **Admissions**: Pipeline management for prospective students.

*(Note: Certain auxillary modules like Finance, Library, Hostel, and Transport are currently designated as 'Under Development' placeholders.)*

---

## 4. Summary of Recent Enhancements
The platform has undergone rigorous stabilization and feature enrichment, particularly in:
1. **Examination Lifecycle**: Full end-to-end examination flows (Scheduling $\rightarrow$ Papers via GForms $\rightarrow$ Marks Entry $\rightarrow$ Auto CGPA calculation $\rightarrow$ Email/Calendar alerts).
2. **Attendance Accuracy**: Refined specific logic ensuring flawless metric calculation.
3. **Automated Onboarding**: Streamlined approval of registration requests with robust email delivery pipelines for credentials.
4. **UI Polishing**: Dark mode optimization, currency localization, and fully responsive timetable rendering.
5. **Architectural Fixes**: Resolution of critical Angular build dependencies (`@angular/cdk`) and Django routing logic.

---
*Generated automatically as a comprehensive snapshot of system capabilities.*
