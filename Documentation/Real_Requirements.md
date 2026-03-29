# Real System Requirements

The College ERP System is built on a specific, open-source technological stack. The deployment, development, and daily operation of this system rely on the following real-world technical requirements based on its actual implementation.

## 1. Frontend Client Specification
**Technology Required:** Angular (v18.0.0)
*   **Implementation:** The entire user interface is implemented as an Angular Single Page Application (SPA), heavily enhanced with the PrimeNG component library for responsive, professional UI elements, and Chart.js for rendering real-time analytics. 
*   **Requirement Rationale:** Angular is strictly required to orchestrate the complex, reactive state management (via RxJS) and seamlessly handle asynchronous JSON communication with the backend APIs without necessitating full, disruptive browser page reloads.

## 2. Backend Server Specification
**Technology Required:** Django & Django REST Framework (DRF)
*   **Implementation:** The core institutional business logic—including automated attendance metric aggregation, programmatic CGPA recalculations, and strict role-based access control—is handled relentlessly by the Python-based Django backend exposing stateless RESTful APIs.
*   **Requirement Rationale:** The system absolutely requires Django to strictly intercept and validate incoming SPA payloads, execute heavy background computation scripts securely, and handle bulk concurrent HTTP requests efficiently via endpoints like `/api/attendance/` and `/api/exam-attempts/`.

## 3. Database Specification
**Technology Required:** PostgreSQL
*   **Implementation:** All critical institutional data (Student Profiles, Faculty Records, Curriculum Structures, Attendance Logs, Fee Payments, and Exam Results) is securely persisted in a PostgreSQL relational database.
*   **Requirement Rationale:** PostgreSQL is mandatory to enforce the vast network of strict foreign-key relationships and composite unique constraints (e.g., ensuring a student cannot possess multiple conflicting attendance records for the exact same course on the exact same date) designed flawlessly through the Django ORM.

## 4. End-User Accessibility
**Technology Required:** Standard Web Browser (Browser-Based Access)
*   **Implementation:** The decoupled nature of the system dictates that end-users interact exclusively with the compiled Angular frontend served over standard HTTP/HTTPS protocols.
*   **Requirement Rationale:** Students, Faculty, and Administrators firmly require **zero** proprietary hardware or software installations. The system strictly expects users to access their respective role-based portals through any modern, native web browser (such as Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge) residing on any standard internet-connected device (desktop, laptop, tablet, or smartphone).
