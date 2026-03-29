# Entity-Relationship (ER) Architecture

The Entity-Relationship architecture of the College ERP System relies on strict PostgreSQL foreign-key associations managed through the Django ORM. The relational design ensures data integrity, minimizes redundancy, and enforces the institution's business logic across various academic workflows. 

Below is an explanation of the critical relationships driving the system based on actual database schema implementations.

## 1. Student $\leftrightarrow$ Course Relationship
**Relationship Type:** Implicit Many-to-Many (Resolved via associative entities)

Unlike a direct structural link, the relationship between a `Student` and a `Course` in this ERP is dynamically established. 
*   **Structural Binding:** Both `Student` and `Course` entities possess Foreign Keys linking them to the `Department` table, and both contain an integer `semester` attribute. Therefore, a student is inherently associated with the specific courses designated for their active department and semester.
*   **Associative Binding:** The actual Many-to-Many physical relationship is resolved through operational junction tables: `Attendance` and `ExamAttempt`. A single student can have multiple attendance records and exam attempt records across multiple courses, while a single course contains records tying back to multiple students.

## 2. Course $\leftrightarrow$ Faculty Relationship
**Relationship Type:** Many-to-One (Many Courses to One Faculty)

The faculty allocation process is explicitly mapped within the `Course` table schema.
*   **Entity Mapping:** The `Course` table contains a Foreign Key attribute (`allocated_faculty_id`) that references the primary key of the `Faculty` table. 
*   **Database Implication:** This structural design dictates that while a single `Course` entity is assigned to one specific `Faculty` member (for instruction and grading purposes for a particular operational cycle), a single `Faculty` member can be allocated to teach *multiple* `Course` entities simultaneously. 
*   **Operational Effect:** This direct link is what authorizes specific faculty members within the backend APIs to mark attendance or input examination marks exclusively for the courses they are formally allocated to.

## 3. Student $\leftrightarrow$ Attendance Relationship
**Relationship Type:** One-to-Many (One Student to Many Attendance Records)

The attendance tracking system relies on a highly granular, transactional relationship.
*   **Entity Mapping:** The `Attendance` table holds a Foreign Key (`student_id`) referencing the `Student` table, alongside Foreign Keys for `course_id` and `marked_by` (Faculty). 
*   **Database Implication:** A single `Student` entity generates hundreds of individual `Attendance` records throughout a semester. Every time a faculty member submits the presence grid on the frontend, a new row is explicitly inserted into the `Attendance` table tied directly to that student's Primary Key.
*   **Integrity Constraints:** To prevent duplicate logical entries, the `Attendance` table enforces a strict Composite Unique Index on the combination of `(student_id, course_id, date)`. This guarantees that a student cannot possess conflicting presence states for the exact same subject on the exact same day.
*   **Metric Roll-up:** The backend script continuously queries this One-to-Many relationship (e.g., counting all `is_present=True` records linked to a specific `student_id`) to compute and update the master `attendance` percentage attribute residing on the parent `Student` record.
