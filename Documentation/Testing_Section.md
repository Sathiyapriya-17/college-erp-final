# System Testing and Validation

Rigorous system testing was conducted to ensure the College ERP System functions reliably under real-world academic conditions. The testing strategy focused on validating the decoupled architecture, specifically targeting backend API integrity, security protocols, and strict academic business logic.

## 1. API Testing
Given the decoupled nature of the application, comprehensive backend API testing was prioritized to guarantee that the Django server correctly processes Angular HTTP requests.
*   **Endpoint Validation:** Core REST endpoints including `/api/students/`, `/api/exams/`, and `/api/fees/` were tested using manual and automated API client tools (e.g., Postman) to verify standard HTTP status codes (200 OK for fetches, 201 Created for insertions, and 400 Bad Request for malformed payloads).
*   **Payload Verification:** JSON payloads transmitted from the frontend were rigorously tested to ensure the backend strictly validates expected data types. For instance, testing the `/api/exam-attempts/` endpoint to confirm it explicitly rejects `marks_obtained` payloads that exceed the defined `max_marks` threshold for a given course.
*   **Latency Checks:** The `/api/dashboard-stats/` endpoints were monitored to ensure that heavy PostgreSQL aggregation queries resolve and return JSON responses swiftly, maintaining the frontend SPA's real-time responsiveness.

## 2. Authentication and Security Testing
Secure access is paramount for protecting sensitive student academic records and institutional metrics.
*   **Token Generation & Routing:** The `/api/student-login/` and `/api/faculty-login/` endpoints were tested to ensure that valid credentials successfully yield a verifiable stateless authentication token. Post-login routing was tested to confirm that the Angular frontend accurately decodes the user role (Admin, Faculty, Student) and forcibly redirects them to their designated, segregated dashboard.
*   **Unauthorized Access Blocking:** Tests were conducted simulating unauthenticated users or students attempting to access restricted administrative endpoints (e.g., `/api/registration-requests/`). The backend correctly intercepted these requests, consistently returning 401 Unauthorized or 403 Forbidden status codes.
*   **OTP Recovery Verification:** The entire password reset pipeline was validated. This included verifying that `/api/forgot-password/` successfully triggers the SMTP email dispatch, and confirming that the `/api/verify-otp/` endpoint strictly enforces the 10-minute expiration constraint established in the `OTPRecord` model.

## 3. Attendance Validation & Integrity
The attendance module's logic is critical for accurately reflecting a student's academic standing; therefore, deep functional testing was executed on its constraints.
*   **Constraint Testing:** The database enforces a composite unique constraint on `(student_id, course_id, date)`. Tests were explicitly designed to mimic a faculty member accidentally submitting attendance for the same student, in the same subject, on the same day twice. The Django PostgreSQL backend successfully caught the violation and blocked the redundant insertion, maintaining data integrity.
*   **Metric Aggregation Accuracy:** End-to-end transaction tests were conducted wherein a student was marked 'Present' and subsequently 'Absent' via the `/api/attendance/` endpoint. The testing validated that the background backend scripts accurately recognized the toggle and perfectly recalculated the student's cumulative `attendance` percentage attribute on their main profile without error.
*   **Frontend Grid Validation:** On the Angular client, the PrimeNG attendance grid was tested to ensure that faculty cannot submit the form with null/unselected states, forcing a definitive binary choice (Present/Absent) to prevent incomplete database records.
