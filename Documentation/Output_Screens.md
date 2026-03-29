# System Outputs (User Interface)

The College ERP System explicitly renders system outputs through a clean, responsive Angular interface stylized heavily with the PrimeNG component library. Below is a description of the primary user interfaces and outputs encountered across the application.

## 1. Login Interface
The portal entry point is designed for segregated, secure access.
*   **UI Elements:** It features a clear PrimeNG `SelectButton` component allowing users to explicitly toggle their target role (Student, Faculty, or Admin) before entering credentials. It includes standard `InputText` fields for the Username/ID and Password.
*   **Dynamic Outputs:** The component utilizes PrimeNG `Toast` messaging to provide instantaneous, color-coded feedback. Upon a success event, the user experiences a seamless routing transition to their dashboard. On failure (e.g., wrong password or unauthorized role), a red error toaster dynamically renders the specific localized error without reloading the page. It also features modal popups for "Forgot Password" and "Contact Admin" workflows.

## 2. Role-Based Dashboard
Immediately upon authentication, users are redirected to a highly customized landing page outputting aggregated institutional data.
*   **Student Dashboard:** Outputs personalized academic analytics. It displays large metric cards showing current CGPA, total attendance percentage, and pending fee dues. It prominently features a dynamically rendered graphical timetable for the current day and a dedicated feed of recent notices targeting students.
*   **Admin Dashboard:** Outputs macro-level institutional health. It features interactive Chart.js visualizations denoting overall departmental performance (average GPA per department), active user counts, and a real-time system activity log detailing recent backend state changes (e.g., user approvals, exam scheduling).

## 3. Attendance Recording Interface
This output replaces physical paper registers with an interactive, bulk-processing grid.
*   **UI Elements:** Faculty members utilize PrimeNG dropdowns to select their allocated Course and a native date picker for the lecture day.
*   **Dynamic Outputs:** Upon selection, the interface outputs an interactive tabular list of all enrolled students. Faculty interact with binary toggle buttons/checkboxes to mark "Present" or "Absent". Upon clicking "Submit", the system outputs a green PrimeNG success toaster, confirming that the bulk POST request to the `/api/attendance/` endpoint was securely persisted in the database.

## 4. Examination & Marks Entry Interface
A critical academic module designed for high data integrity and automated calculations.
*   **Scheduling View:** Outputs a chronological list of scheduled assessments for HODs and Students, displaying exam dates, associated courses, and attached digital evaluation links (e.g., Google Forms).
*   **Marks Entry Form:** For faculty, this interface outputs a secure, line-by-line input grid locked to a specific exam. Faculty type raw numeric scores into the grid fields. Submitting this grid visually outputs a success state, while asynchronously triggering the backend to recalculate the affected students' CGPAs.

## 5. Notices & Communications Board
A modernized digital bulletin board replacing traditional institutional paper memos.
*   **UI Elements:** Outputs a scrollable, paginated list of announcements fetched from the Django backend.
*   **Dynamic Outputs:** Notices are visually tagged with color-coded priority flags (e.g., a red 'IMPORTANT' badge vs. a blue 'NORMAL' badge). Crucially, for critical institutional memos targeting Faculty, the UI outputs an interactive "Acknowledge" button. Clicking this records the interaction to the `NoticeAcknowledgment` API and dynamically updates the UI state to reflect that the faculty member has officially read the mandate.
