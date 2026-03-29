# Data Dictionary

This data dictionary outlines the schema of the core PostgreSQL database tables utilized by the College ERP System, accurately reflecting the Django models implemented in the project.

## 1. Department Table
Stores institutional department structures.

| Field Name | Data Type | Constraint/Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `name` | Varchar(100) | Name of the department (e.g., Computer Science) |
| `code` | Varchar(10) | Unique identifier code (e.g., CSE) |
| `hod` | Varchar(100) | Name of the Head of Department (Nullable) |
| `established` | Varchar(4) | Year of establishment (Nullable) |
| `status` | Varchar(20) | Operational status, default 'Active' |

## 2. Course Table
Defines the academic subjects and curriculums offered.

| Field Name | Data Type | Constraint/Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `name` | Varchar(100) | Full name of the course/subject |
| `code` | Varchar(20) | Unique subject code |
| `department_id` | Integer | Foreign Key $\rightarrow$ Department (`id`) |
| `semester` | Integer | Associated academic semester, default 1 |
| `credits` | Integer | Academic credit weightage, default 3 |
| `allocated_faculty_id` | Integer | Foreign Key $\rightarrow$ Faculty (`id`) (Nullable) |
| `version` | Varchar(20) | Syllabus version, default '1.0' |
| `outcomes` | Text | Description of course learning outcomes |

## 3. Student Table
Central repository for all student academic profiles.

| Field Name | Data Type | Constraint/Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `user_id` | Integer | One-To-One Key $\rightarrow$ Auth User (Django) |
| `name` | Varchar(100) | Student's full name |
| `student_id` | Varchar(20) | Unique Roll No (e.g., PCMKPM2601) |
| `department_id` | Integer | Foreign Key $\rightarrow$ Department (`id`) |
| `semester` | Integer | Current active semester |
| `gpa` | Float | Calculated Cumulative GPA |
| `attendance` | Float | Calculated cumulative attendance % |
| `status` | Varchar(20) | Academic standing (e.g., 'Excellent', 'Average') |

## 4. Attendance Table
Logs the daily presence of students per course.

| Field Name | Data Type | Constraint/Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `student_id` | Integer | Foreign Key $\rightarrow$ Student (`id`) |
| `course_id` | Integer | Foreign Key $\rightarrow$ Course (`id`) |
| `marked_by_id` | Integer | Foreign Key $\rightarrow$ Faculty (`id`) |
| `date` | Date | Date of the class/lecture |
| `is_present` | Boolean | True for Present, False for Absent |
| *(Composite Unique Index)* | n/a | Enforces uniqueness on (`student_id`, `course_id`, `date`) |

## 5. Exam Table
Manages the scheduling and tracking of assessments.

| Field Name | Data Type | Constraint/Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `title` | Varchar(200) | Title of the exam (e.g., 'Mid-Term 1') |
| `department_id` | Integer | Foreign Key $\rightarrow$ Department (`id`) |
| `course_id` | Integer | Foreign Key $\rightarrow$ Course (`id`) |
| `faculty_id` | Integer | Foreign Key $\rightarrow$ Faculty (`id`) |
| `date` | Date | Scheduled date of the examination |
| `max_marks` | Integer | Maximum scorable marks, default 100 |
| `google_form_link` | URL | External link for digital assessment (Nullable) |
| `is_approved` | Boolean | Approval status by HOD, default False |
| `created_at` | Timestamp | Auto-generated timestamp upon creation |

## 6. Notice Table
Stores institutional broadcasts and announcements.

| Field Name | Data Type | Constraint/Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `title` | Varchar(200) | Headline of the notice |
| `description` | Text | Detailed announcement body |
| `target_role` | Varchar(10) | Target audience: 'STUDENT', 'FACULTY', or 'BOTH' |
| `priority` | Varchar(10) | Importance level: 'NORMAL' or 'IMPORTANT' |
| `created_at` | Timestamp | Auto-generated publication timestamp |
| `expiry_date` | Timestamp | Date when the notice is archived (Nullable) |
| `is_active` | Boolean | Visibility toggle status, default True |
