# System Modules

The College ERP System is partitioned into distinct, highly cohesive functional modules, each driven by specific RESTful backend APIs and rendered through targeted Angular frontend components. Below is a comprehensive breakdown of the implemented modules based on the actual system architecture.

## 1. Authentication & Onboarding Module
This module ensures secure, segregated entry into the system and streamlines the provisioning of new users.
*   **Core Functionality:** It segregates user entry via `/api/student-login/` and `/api/faculty-login/` endpoints, returning secure, stateless authentication tokens. 
*   **Onboarding:** Prospective students and staff submit queries via the `/api/registration-requests/` API. Upon administrator approval, the system programmatically generates standardized username formats and dispatches comprehensive login credentials via an SMTP email pipeline.
*   **Account Recovery:** It utilizes a secure OTP (One-Time Password) generation and validation flow through `/api/forgot-password/` and `/api/verify-otp/`.

## 2. Student Management Module
This module is the central repository for administering the student lifecycle.
*   **Core Functionality:** Managed via the `/api/students/` API, this module tracks dynamic student profiles, encompassing their linked department, current semester, cumulative GPA, aggregate attendance metrics, and overall academic standing. 

## 3. Faculty (HR) Management Module
Dedicated to managing the institution's human capital and instructing staff.
*   **Core Functionality:** Operated through the `/api/faculty/` API, this module maintains records of faculty designations, qualifications, contact information, and specific academic course alignments.

## 4. Academic Configuration Module *(Additional Module)*
An essential structural module establishing the academic backbone of the college.
*   **Core Functionality:** Driven by the `/api/departments/` and `/api/courses/` APIs, this module allows administrators to establish the institutional hierarchy. It controls the creation of specialized courses, assigning credit values, defining curriculum versions, and formally allocating subjects directly to faculty members.

## 5. Attendance Module
A critical operational module transitioning the college away from manual tracking.
*   **Student Attendance:** Utilizing the `/api/attendance/` endpoint, faculty mark daily student presence programmatically mapped to specific courses and dates. The backend instantly computes monthly percentages.
*   **Faculty Tracking:** A dedicated `/api/faculty-attendance/` endpoint allows HR to securely monitor staff presence and absences autonomously.

## 6. Examination & Grading Module
This module governs the entire assessment lifecycle, removing vast amounts of manual mathematical overhead.
*   **Exam Scheduling:** Through the `/api/exams/` API, HODs schedule assessments, appending external digital assessment links (like Google Forms), which trigger respective Google Calendar alerts.
*   **Automated Evaluation:** Faculty systematically input detailed student marks via the `/api/exam-attempts/` API endpoint. Upon submission, the backend scripts autonomously recalculate and update the student's holistic CGPA precisely based on course credit weights.

## 7. Timetable Module
A sophisticated module managing temporal and spatial institutional resources.
*   **Core Functionality:** Powered by the `/api/timetable/` API, it binds faculty, courses, rooms, and day-time slots. This structured data drives interactive, drag-and-drop Angular components for administrative editors, while rendering clean, graphical weekly view-only schedules for students.

## 8. Communications & Notice Module
This module modernizes institutional messaging, replacing physical bulletin boards.
*   **Targeted Announcements:** Handled via the `/api/notices/` API, administrators broadcast digital alerts designated exclusively for Students, exclusively for Faculty, or universally (Both), alongside priority flagging.
*   **Acknowledgment Tracking:** The `/api/notice-acknowledgments/` API explicitly records which faculty members have definitively viewed and accepted critical administrative notices.

## 9. Fee Management Module
A streamlined financial repository tracking student monetary obligations.
*   **Core Functionality:** Operated via the `/api/fees/` API, the system records individual student dues, tracks multi-part installation payments, applies automated fines for delays, and archives discrete payment references for seamless financial audits.

## 10. Analytics & Auditing Module
This module extracts massive amounts of raw database information and converts it into actionable institutional intelligence.
*   **Analytics Dashboards:** The `/api/dashboard-stats/` and `/api/academic-analytics/` endpoints execute complex aggregations (like institutional attendance trends or fee deficit summaries) and feed this JSON data directly to Angular's Chart.js components for real-time visual rendering.
*   **System Integrity Audit:** The `/api/activity-logs/` API provides transparency by securely recording every critical action (e.g., marks modification, user approval) taken across the platform, maintaining strict institutional compliance.
