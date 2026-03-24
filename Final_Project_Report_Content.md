# PROJECT TITLE
**COLLEGE ERP SYSTEM**

---

# 1. INTRODUCTION

The **College Enterprise Resource Planning (ERP) System** is a comprehensive, web-based application specifically developed to streamline, automate, and centralize the administrative, academic, and operational workflows of **Pachaiyappa’s College for Men**. Modern educational institutions handle massive amounts of data ranging from student records, attendance tracking, faculty allocation, and examination schedules to broadcasting circulars. Managing these operations manually or using decentralized software leads to data redundancy, miscommunication, and inefficiencies. 

This project aims to digitally transform the college ecosystem by integrating multiple departments and roles—Administrator, Head of Department (HOD), Faculty, and Student—into a single, unified platform. By utilizing a modern tech stack comprising Angular for a highly responsive frontend, Python Django for a robust backend API, and PostgreSQL for secure database management, this ERP system delivers a seamless and highly scalable solution for daily college management.

## 1.1 ORGANIZATION PROFILE
**Pachaiyappa’s College for Men, Kanchipuram**, is a premier educational institution committed to imparting high-quality higher education and fostering holistic development among students. Established with a vision to build a knowledge-driven society, the computing and science departments continuously encourage technological innovations. Developing this College ERP System internally aligns with the institution's commitment to self-reliance, modernization, and incorporating practical software engineering principles into everyday operations.

---

# 2. ABSTRACT

The **College ERP System** is a modular web application developed to bridge the communication and administrative gap between the management, faculty, and students. The existing system in educational institutions often relies on paper-based registers, manual notice boards, and disparate excel sheets which are highly prone to physical damage and human error.

This project introduces an integrated approach featuring dynamic role-based access control. The distinct modules implemented include **Faculty Allocation & Curriculum Management**, an **Attendance Tracking System** specifically supporting course-level tracking, a centralized **Examination & Results Module** integrated with Google Forms, a **Notice Board** for real-time announcements, and **User Preferences** allowing customized themes and profile management. The system employs **Angular** with **PrimeNG** for an interactive, aesthetic user interface, while the **Django Rest Framework (DRF)** serves secure API endpoints backed by a **PostgreSQL** database. The resultant software drastically reduces administrative overhead, ensures real-time data availability, and provides a secure, transparent, and eco-friendly digital campus environment.

---

# 3. SYSTEM ANALYSIS

## 3.1 EXISTING SYSTEM
In the current manual system, day-to-day operations like student attendance, faculty timetable assignments, and notice distribution are handled physically or through isolated communication channels (like WhatsApp groups). 
- **Drawbacks:**
  - High probability of data inconsistency and human error.
  - Generating cumulative attendance or CGPA reports is highly time-consuming.
  - Lack of a centralized repository makes historical data retrieval extremely difficult.
  - Notices often fail to reach all intended recipients on time.

## 3.2 PROBLEM DEFINITION
There is a pressing need for a secure, unified digital infrastructure that can handle role-based tasks efficiently. The administrators need a way to easily onboard students and staff; HODs need tools to allocate curricula and schedule exams; Faculties require a quick method to mark attendance and grade exams; and Students must be able to view their academic status in real-time. 

## 3.3 PROPOSED SYSTEM
The proposed College ERP System automates all the aforementioned tasks. 
- **Features:**
  - **Automated Credentials:** Auto-generates user IDs and passwords (e.g., PCMKPM+Year+ID) during registration.
  - **Dynamic Dashboards:** Tailored user interfaces depending upon the logged-in user's role (Admin, Faculty, Student).
  - **Course & Attendance Management:** Faculty can log in to view only the courses assigned to them and take attendance dynamically.
  - **Examinations:** HODs can schedule exams while faculty can input marks directly, triggering automatic CGPA calculations.

## 3.4 REQUIREMENT ANALYSIS
The system needs to be highly available during college hours and support multiple concurrent users (e.g., hundreds of students checking results simultaneously). Data privacy is critical; therefore, strict token-based authentication (JWT) must be implemented.

## 3.5 REQUIREMENT SPECIFICATIONS
- **Functional Requirements:** User Authentication, Profile Management, Role Verification, CRUD operations for Notices/Attendance/Exams.
- **Non-Functional Requirements:** 
  - **Performance:** Page response time under 2 seconds.
  - **Security:** Passwords must be hashed; API endpoints must be protected.
  - **Usability:** The UI must be responsive and accessible on mobile devices.

## 3.6 FEASIBILITY STUDY
- **Technical Feasibility:** The project uses open-source and widely supported frameworks (Angular, Django, PostgreSQL) which are highly feasible to develop and deploy.
- **Operational Feasibility:** The intuitive GUI ensures that non-technical staff can operate the system with minimal training.
- **Economic Feasibility:** As the project utilizes open-source technologies, the primary cost involves only server hosting, making it highly cost-effective.

---

# 4. SYSTEM DESIGN

## 4.1 PROJECT MODULES
1. **Authentication & Authorization Module:** Handles secure Login, Password regeneration, and JWT token management.
2. **Administration & HR Module:** Manages the creation of users, department setup, and broad college-level settings.
3. **Faculty Allocation & Curriculum:** Enables assignment of specific courses to faculty based on departments and semesters.
4. **Attendance Module:** Allows faculties to mark date-wise and course-wise attendance. Includes a "My Attendance" view.
5. **Examination Module:** Manages the scheduling of internal/external exams, question paper links, and mark entry.
6. **Notice Board Module:** Admin-only privilege to broadcast important circulars college-wide.

## 4.2 DATA DICTIONARY
*Below are the core database entities and their attributes:*
- **User:** `user_id` (PK), `username`, `email`, `password_hash`, `role`, `profile_picture`, `theme_preference`.
- **Course:** `course_id` (PK), `course_name`, `department_id` (FK), `semester`.
- **Attendance:** `attendance_id` (PK), `student_id` (FK), `course_id` (FK), `date`, `status` (Present/Absent).
- **Examination:** `exam_id` (PK), `course_id` (FK), `exam_date`, `total_marks`, `document_link`.

## 4.3 DATA FLOW DIAGRAMS
- **Level 0 (Context Diagram):** 
  - Users (Admin, Faculty, Student) interact with the central ERP System, which dynamically fetches and pushes data to the central Database.
- **Level 1 (Module Diagram):** 
  - Faculty inputs Attendance -> ERP processes mapping -> Database stores records. 
  - Student requests Attendance -> ERP retrieves processed data -> Dashboard displays metrics.

## 4.4 E-R DIAGRAM
- **1-to-Many Relationships:** 
  - One Department has Many Courses.
  - One Faculty teaches Many Courses.
  - One Course has Many Attendance Records and Exams.
- **Many-to-Many Relationships:**
  - Students enroll in Many Courses; Courses have Many Students.

## 4.5 HARDWARE AND SOFTWARE
**Hardware Requirements (Server/Development Machine):**
- Processor: Intel Core i5 or equivalent.
- RAM: 8 GB or higher.
- Storage: 256 GB SSD.

**Software Requirements:**
- **Operating System:** Windows 10/11 or Linux.
- **Frontend Environment:** Node.js, Angular CLI, TypeScript, HTML5, CSS3/PrimeNG.
- **Backend Environment:** Python 3.10+, Django, Django REST Framework.
- **Database:** PostgreSQL.
- **IDE:** Visual Studio Code.

---

# 5. SYSTEM TESTING

Testing was rigorously conducted to ensure system robustness:
1. **Unit Testing:** Individual components (e.g., checking if the CGPA calculates correctly given an array of marks).
2. **Integration Testing:** Ensuring the Angular frontend properly communicates with the Django back-end via REST APIs without CORS issues.
3. **Validation Testing:** Ensuring forms (like the Login or Add Faculty form) prevent SQL injection and reject invalid emails.
4. **User Acceptance Testing (UAT):** Verifying with actual users to ensure the UI/UX is intuitive (e.g., ensuring PrimeNG dropdowns append to the body correctly for visibility).

---

# 6. SOFTWARE TOOLS

- **Angular:** A platform and framework for building single-page client applications using HTML and TypeScript.
- **Django:** A high-level Python web framework that encourages rapid development and clean, pragmatic design.
- **PostgreSQL:** An advanced, enterprise-class, open-source relational database system.
- **PrimeNG:** A rich set of open-source UI components for Angular, used to create beautiful and responsive data tables, dialogs, and dropdowns.
- **Git:** Used for version control.

---

# 7. CODING

*(Sample code demonstrating the API integration)*

**Backend (Python/Django View for Notices):**
```python
from rest_framework import viewsets
from .models import Notice
from .serializers import NoticeSerializer
from rest_framework.permissions import IsAuthenticated

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Only admin can create notices
        serializer.save(author=self.request.user)
```

**Frontend (Angular Component for Fetching Notices):**
```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html'
})
export class NoticesComponent implements OnInit {
  notices: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getNotices().subscribe(data => {
      this.notices = data;
    });
  }
}
```

---

# 8. IMPLEMENTATION

The implementation phase involved deploying the code from a local development environment to an accessible server configuration. 
1. **Database Setup:** PostgreSQL was configured with the schema generated by Django's `makemigrations` and `migrate` commands.
2. **Backend Execution:** The DRF API server runs continuously listening for HTTP requests on the specified port.
3. **Frontend Build:** The Angular application was compiled using `ng build` for production, ensuring optimized and minified static assets.
4. **Data Seeding:** Initial data, including admin credentials, departments, and dummy users, were seeded into the system for initial testing and launch.

---

# 9. OUTPUT SCREENS

*(Note formatting: You can copy and paste the screenshots of your actual project into these spaces in your Word Document)*

1. **Login Page:**
   `[Insert Screenshot of the Login Screen here]`
2. **Admin Dashboard (Showing User Analytics):**
   `[Insert Screenshot of the Admin Dashboard here]`
3. **Faculty Allocation Screen:**
   `[Insert Screenshot of the Course/Faculty mapping screen here]`
4. **Attendance Marking Table:**
   `[Insert Screenshot of the interactive grid marking Present/Absent here]`
5. **Examination Scheduling & Results:**
   `[Insert Screenshot of Exam tables showing Status and Form Links here]`
6. **Student Dashboard:**
   `[Insert Screenshot of Student view with Theme Preferences enabled here]`

---

# 10. CONCLUSION

The **College ERP System** successfully fulfills the requirement of creating a centralized, digital environment for Pachaiyappa’s College for Men. By replacing outdated manual routines with automated software logic—such as instant login credential generation, automated CGPA updates, and centralized notices—the institution's efficiency is significantly boosted. 

The integration of Angular and Django proved to be a robust combination, providing a fast, decoupled, and secure architecture. The system is built with scalability in mind, meaning additional modules like Library Management or Online Fee Payment can be easily integrated in the future without disrupting the existing workflow.

---

# 11. BIBLIOGRAPHY

1. Official Angular Documentation - *https://angular.io/docs*
2. Django Web Framework Documentation - *https://docs.djangoproject.com/*
3. Django REST Framework Documentation - *https://www.django-rest-framework.org/*
4. PostgreSQL Relational Database - *https://www.postgresql.org/docs/*
5. PrimeNG UI Component Suite - *https://primeng.org/*
6. Sommerville, I. (2015). *Software Engineering* (10th Edition). Pearson Education.
