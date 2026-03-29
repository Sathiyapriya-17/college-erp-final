# COLLEGE ERP SYSTEM
## Postgres Graduate (PG) Project Report

### 1. Abstract
The College Enterprise Resource Planning (ERP) System is a comprehensive, digital solution designed to streamline and automate the administrative, academic, and operational processes of higher education institutions. By adopting a modern decoupled architecture, the system separates the frontend user interface from the backend business logic, ensuring scalability, security, and maintainability. This project aims to replace disparate legacy systems with a unified platform that serves Students, Faculty, and Administrators through role-specific portals. Key functionalities implemented include attendance tracking, end-to-end examination management (including auto CGPA calculations and Google Forms integration), dynamic timetable visualization, user onboarding, and centralized notice broadcasting. 

### 2. Introduction
In the contemporary higher education landscape, an Enterprise Resource Planning (ERP) system is no longer a luxury but a critical necessity. Colleges handle massive volumes of data daily, from student enrollments and academic records to faculty schedules and institutional finances. Traditional, manual systems rely on fragmented spreadsheets and physical ledgers, leading to severe inefficiencies, data silos, high margins of error, and delayed decision-making. 

The College ERP System was developed to resolve these challenges by providing a centralized, digital ecosystem that streamlines operations across all departments. By replacing manual tracking with digital workflows, the system ensures data integrity, transparency, and real-time accessibility. It caters to the specific needs of the institution through dedicated, role-based dashboards that empower three primary stakeholders:
*   **Administrators:** Gain a comprehensive bird’s-eye view of institutional health, seamless user onboarding, and centralized control over departments.
*   **Faculty:** Equipped with powerful tools to automate daily administrative burdens, particularly through seamless attendance automation and comprehensive exam management (including scheduling, question paper integration, and grading).
*   **Students:** Provided with a personalized portal to track their academic standing, view dynamic timetables, monitor their attendance metrics, and receive timely institutional notices.

### 3. System Architecture & Design
The project utilizes a decoupled client-server architecture.
*   **Backend (API Layer):** Developed using the Django framework enhanced with the Django REST Framework (DRF) to provide secure, stateless RESTful APIs. It handles all business logic, data validation, authentication, and database interactions.
*   **Frontend (Presentation Layer):** Built using Angular, taking advantage of its component-based architecture to provide a reactive Single Page Application (SPA). PrimeNG is utilized as the primary UI component library to ensure a professional, cohesive, and responsive design.
*   **Data Persistence:** PostgreSQL is used as the primary relational database, chosen for its reliability and complex query handling capabilities, which are essential for academic data relationships.

### 4. Technology Stack
**4.1. Client-Side (Frontend)**
*   **Framework:** Angular (v18.0.0)
*   **Language:** TypeScript
*   **UI Library:** PrimeNG (17.18.0)
*   **Styling:** PrimeFlex & PrimeIcons
*   **Charting:** Chart.js (v4.5.1) used for academic analytics dashboards
*   **State & Reactivity:** RxJS

**4.2. Server-Side (Backend)**
*   **Framework:** Django with Django REST Framework (DRF)
*   **Language:** Python
*   **Email Integration:** Django SMTP Backend (Gmail configuration for OTPs and user credentials)
*   **Cross-Origin:** django-cors-headers

**4.3. Database & Storage**
*   **Database Management System:** PostgreSQL
*   **Database Adapter:** psycopg2-binary
*   **ORM:** Django Object-Relational Mapper

### 5. Implementation of Core Modules

#### 5.1. Authentication and Security
The system implements secure, role-based access control.
*   **Login Endpoints:** Segregated endpoints `student-login/` and `faculty-login/` accurately route users to their respective dashboards.
*   **Automated Onboarding:** A robust Registration Request pipeline allows new users to request access. Upon admin approval (`RegistrationRequestActionView`), the system automatically provisions accounts, generates predictable username formats (e.g., PCMKPM + Year + ID), and dispatches credentials via email.
*   **Password Management:** Integrated OTP verification (`verify-otp/`) and password reset flows ensure account recovery is secure.

#### 5.2. Academic and Curriculum Management
*   **Department & Course Models:** The system hierarchically structures the institution into Departments (`DepartmentViewSet`), under which specific Courses and degree programs (`CourseViewSet`) are managed.
*   **Course Assignment:** Faculty members are allocated specific subjects via the curriculum builder interface.

#### 5.3. Attendance Management
*   **Student Attendance:** Allows faculty to record attendance against specific courses and dates. The `Attendance` model ensures data integrity with unique constraints on `(student, course, date)`.
*   **Faculty Attendance:** A dedicated `FacultyAttendance` module tracks staff presence, viewable by HR/Administration and the faculty members themselves.

#### 5.4. Examination and Grading System
*   **Scheduling:** HODs and faculty can schedule exams (`ExamViewSet`), integrating external question paper links (e.g., Google Forms) and triggering automated Google Calendar alerts and email notifications.
*   **Evaluation:** The `ExamAttemptViewSet` manages the entry of student marks. The backend implementation automatically triggers CGPA recalculations upon marks submission, ensuring real-time academic standing updates.

#### 5.5. Timetable Visualization
The `TimetableEntry` model stores class schedules mapped to departments, semesters, days, and time slots. The frontend provides specialized views: an editable, interactive interface for faculty to configure the schedule, and a read-only graphical view for students.

#### 5.6. Notices and Communications
A global and targeted announcement system (`NoticeViewSet`). Notices can be filtered by target roles (Student, Faculty, or Both) and priority. The `NoticeAcknowledgment` model tracks which faculty members have read critical announcements.

#### 5.7. Administration and Analytics
*   **Audit Logging:** An `ActivityLog` model tracks critical system events, providing administrators with transparent oversight of user actions.
*   **Dashboard Stats:** Comprehensive aggregation endpoints (`DashboardStatsView`, `AcademicAnalyticsView`) feed data to the frontend Chart.js components, offering birds-eye views of attendance trends, enrollment statistics, and financial summaries.

### 6. Database Schema Highlights
The database is highly relational, utilizing Foreign Keys to bind entities. 
*   The `Student` and `Faculty` models extend the base Django `User` model via OneToOne relationships, adding role-specific metadata (e.g., `student_id`, `gpa`, `designation`).
*   The `Fee` model tracks financial dues, installments, and payment statuses tied directly to the `Student` profile.
*   `RegistrationRequest` tracks the entire lifecycle of a user attempting to join the system, storing admin notes, rejection reasons, and generated credentials.

### 7. Conclusion
The College ERP System successfully models the complex workflows of a modern educational institution. By leveraging Django's robust backend capabilities and Angular's responsive frontend paradigm, the system delivers functionality that significantly reduces administrative overhead. Features like automated marks-to-CGPA calculation, seamless API-driven attendance marking, and email-integrated user provisioning highlight the practical effectiveness of the implemented technology stack. The resulting platform is scalable, secure, and ready for institutional deployment.
