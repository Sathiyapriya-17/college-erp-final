# System Requirements Specification

The College ERP System is engineered to address the distinct needs of the institution through a robust set of functional and non-functional requirements aligned deeply with the decoupled implementation. 

## 1. Functional Requirements
Functional requirements define the core operational capabilities and services that the ERP system must provide through its backend APIs and frontend interfaces.

### 1.1. Student & Faculty Management
*   **User Provisioning:** The system must provide a Registration Request pipeline allowing administrators to systematically approve new users, which automatically triggers the generation of standardized credentials (e.g., PCMKPM + Year + ID) and dispatches them via SMTP email.
*   **Profile Tracking:** It must maintain highly relational data for students (tracking GPAs, semesters, and departments) and faculty (tracking designations and allocated subjects).
*   **Role-Based Access:** The application must strictly enforce role-based routing (Admin, Faculty, Student) displaying uniquely tailored dashboards post-authentication.

### 1.2. Attendance Management via API
*   **Dynamic Logging:** The backend `Attendance` API must allow faculty to record student presence or absence precisely mapped to specific courses and dates through a responsive frontend grid layout.
*   **Faculty Tracking:** A dedicated `FacultyAttendance` module must track staff presence for administrative oversight.
*   **Automated Aggregation:** The system must instantly compute cumulative attendance percentages, feeding real-time metric data to student dashboards and Chart.js analytics for administrative review.

### 1.3. Examination & Grading via API
*   **Exam Scheduling:** The `ExamViewSet` API must facilitate the creation of examination schedules, enabling faculty to attach external digital assessments (such as Google Form links) and automatically issue corresponding Google Calendar alerts and email notifications.
*   **Automated CGPA Computation:** Through the `ExamAttemptViewSet`, the backend must accept line-by-line student marks from faculty and programmatically execute scripts to recalculate the student's CGPA autonomously, entirely neutralizing manual grading mathematics.

### 1.4. Centralized Notice System
*   **Targeted Announcements:** The `NoticeViewSet` API must empower administrators to publish digital announcements across the institution. Notifications must be filterable by target audiences (Student, Faculty, or Both) and priority levels.
*   **Acknowledgment Tracking:** The system must incorporate mechanisms (`NoticeAcknowledgment` model) to track and verify when faculty members have read critical institutional alerts.

---

## 2. Non-Functional Requirements
Non-functional requirements dictate the operational qualities, architectural integrity, and user experience standards of the ERP system.

### 2.1. Security and Authentication
*   **Stateless Security:** The decoupled architecture dictates that all communications between the Angular SPA and Django REST APIs must be secured using robust, stateless authentication tokens (such as JWT/Session Auth), ensuring that user sessions are rigorously validated before executing any CRUD operations.
*   **Data Confidentiality:** Sensitive institutional data, specifically student academic marks and financial fee statuses stored in the PostgreSQL database, must be protected against SQL injection and unauthorized role access.
*   **Credential Recovery:** The platform must implement a time-sensitive, secure OTP (One-Time Password) generation and verification workflow for password resets.

### 2.2. System Performance
*   **Client-Side Rendering:** As a Single Page Application (SPA), the Angular frontend must ensure seamless navigation without hard page reloads. DOM rendering must happen client-side swiftly.
*   **Backend Optimization:** The Django framework must execute heavy data aggregations (such as monthly attendance calculations or complex JOIN operations across department records) efficiently to ensure API response times ideally remain sub-second.

### 2.3. Scalability
*   **Decoupled Agility:** By decoupling the presentation layer from the business logic layer, the infrastructure must be independently scalable. If API traffic surges (e.g., during result publication or course registration weeks), the backend server can be scaled vertically or horizontally without necessitating frontend codebase alterations.
*   **Database Robustness:** The underlying PostgreSQL database must be structured with explicit foreign keys, indexing, and optimized schemas to effortlessly handle the influx of thousands of simultaneous read/write requests from concurrent users.

---

## 3. Hardware and Software Requirements

### 3.1. Server-Side (Backend & Database)
**Hardware:**
*   **Processor:** Minimum Intel Core i5 or AMD Ryzen 5 (or equivalent cloud vCPU)
*   **RAM:** 8 GB Minimum (16 GB Recommended for production scaling)
*   **Storage:** 50 GB SSD Minimum for OS, application files, and daily database backups

**Software:**
*   **Operating System:** Linux (Ubuntu 20.04/22.04 LTS recommended) or Windows Server
*   **Web Server Configuration:** Nginx or Apache (for reverse proxy)
*   **Environment:** Python 3.10+, pip (Python package manager)
*   **Database Engine:** PostgreSQL 14+

### 3.2. Client-Side (End-User Access)
**Hardware:**
*   Any standard desktop, laptop, or mobile device with active internet connectivity.
*   **RAM:** 4 GB Minimum (for smooth UI rendering)

**Software:**
*   **Web Browser:** Modern browsers supporting HTML5, ES6, and client-side rendering (e.g., Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
*   *Note: No proprietary client-side application installations are required as the system is delivered entirely as a web-based Single Page Application (SPA).*

### 3.3. Development Environment Requirements
Required for compilation, testing, and continuous integration:
*   **Frontend Tools:** Node.js (v18+) and npm, Angular CLI (v18.0.0)
*   **Backend Tools:** Python 3.10+, virtualenv
*   **Database:** PostgreSQL Server and pgAdmin (optional for GUI management)
