# Data Flow Architecture

The data flow within the College ERP System follows a decoupled, asynchronous model where the Angular frontend acts as the stateful client proposing actions, and the Django backend operates as the stateless, authoritative validator and executer interacting with the PostgreSQL database.

Below are three critical data flow sequences representing actual system workflows.

## 1. Authentication (Login) Flow

This sequence guarantees secure, role-based entry into the system.

1.  **Client Request:** The user enters their credentials (username and password) into the Angular Login Component.
2.  **API Transmission:** The Angular SPA compiles the data into a JSON payload and transmits an HTTP POST request to the corresponding backend endpoint (either `/api/student-login/` or `/api/faculty-login/`).
3.  **Backend Validation:** The Django backend intercepts the request, hashes the password, and queries the PostgreSQL `User` and linked `Student`/`Faculty` tables to authenticate the credentials.
4.  **Token Generation:** Upon successful validation, Django generates a secure, stateless Authentication Token (JWT/Session).
5.  **Client Response:** The backend returns the token along with basic user metadata (User ID, Role) via JSON.
6.  **State Update:** The Angular application stores the token in local session storage, updates the global authentication state via RxJS, and securely routes the user to their respective role-based Dashboard.

## 2. Attendance Marking Flow

This sequence illustrates how real-time academic tracking is achieved.

1.  **Frontend Interaction:** A faculty member utilizes the 'Attendance Recording' Angular component, selecting a specific Course, Date, and toggling the presence status of enrolled students on an interactive PrimeNG grid.
2.  **API Transmission:** Upon submission, Angular aggregates the presence data into a bulk JSON array and sends an HTTP POST request to the `/api/attendance/` endpoint.
3.  **Backend Processing:** Django receives the payload. It first validates the faculty member's authentication token to ensure authorization for that specific course.
4.  **Database Persistence:** Django iterates through the payload, creating or updating records in the PostgreSQL `Attendance` table.
5.  **Metric Aggregation:** Immediately following persistence, Django executes an internal method to recalculate the aggregate cumulative attendance percentage for every affected `Student` profile mapped in the database.
6.  **Client Response:** Django returns a HTTP 200/201 Success status. Angular intercepts this and triggers a PrimeNG success toaster notification, officially completing the workflow.

## 3. Examination Result & CGPA Flow

This sequence demonstrates automated background computations eliminating manual mathematics.

1.  **Frontend Interaction:** A faculty member navigates to the Examination Marks Entry component, inputting raw scores obtained by students for a specific `Exam` entity.
2.  **API Transmission:** Angular formulates a JSON payload mapping `student_id`s to `marks_obtained` and sends an HTTP POST/PATCH request to the `/api/exam-attempts/` endpoint.
3.  **Backend Validation & Persistence:** Django validates the faculty token and the input ranges (ensuring marks do not exceed `max_marks`). It then saves these individual score records into the PostgreSQL `ExamAttempt` table.
4.  **Automated CGPA Recalculation:** Crucially, the backend does not stop at persistence. The Django view automatically triggers a recalculation script. It fetches all historical exam attempts for the affected students, factors in the respective `Course` credits, and recalculates the exact new Cumulative Grade Point Average (CGPA).
5.  **Profile Update:** The newly calculated CGPA is instantly updated and saved directly onto the PostgreSQL `Student` table.
6.  **Visibility:** The backend returns a success response. The next time the affected student accesses their Angular dashboard, the frontend fetches their profile via the `/api/students/` endpoint, instantly displaying the freshly calculated CGPA without any manual administrative intervention.
