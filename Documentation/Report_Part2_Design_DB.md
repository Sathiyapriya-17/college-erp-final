# PART 2: SYSTEM DESIGN, DATA DICTIONARY, & IMPLEMENTATION DETAILS 
*(Note: To achieve 60 pages in MS Word, use Times New Roman, size 12, with 1.5 line spacing. Each major heading should start on a new page. Include large diagrams and screenshots where indicated.)*

---

# 6. SYSTEM DESIGN
The system design phase translates the requirement specifications into an architectural blueprint. The architecture of the College ERP system follows a strict Client-Server decoupled model. 
- **The Client Layer:** Formulated in Angular (HTML/PrimeNG/SCSS/TS), compiling into a static SPA deployed potentially on a CDN or Nginx.
- **The Application Layer (Server Layer):** Django acting as the core brain processing business logic, routing requests, extracting JSON web tokens, and interacting closely with models.
- **The Database Layer:** PostgreSQL serving as the persistence foundation.

## 6.1 Unified Modeling Language (UML) Diagrams

*(In MS Word, ensure to use a visual tool like draw.io or Visio to create these diagrams and paste them on entire distinct pages)*

### 6.1.1 Use Case Diagram Description
- **Actor (Administrator):** Can manage global settings (Add/Delete/Approve Faculty and Students), configure general system parameters, generate widespread priority Notices.
- **Actor (Head of Department - HOD):** Can formulate course architectures, assign existing faculty strictly within their department parameters, and schedule official examinations.
- **Actor (Faculty):** Can log into their localized Dashboard, retrieve assigned timetables/courses, utilize dynamic grids to mark attendance accurately, modify and input internal assessment metrics (Marks), and update customized Profile parameters (Themes).
- **Actor (Student):** Can observe course schedules, view total and course-wise attendance percentages, review scheduled examination timings alongside google form action links, and engage with their individual thematic preferences.

### 6.1.2 Class Diagram Description
*(Representing the Python Django Model Layer Structure)*
- **User Class:** Maps 1-to-1 with Faculty/Student Classes utilizing Django's abstract user mechanics.
- **RegistrationRequest Class:** Maps to User. Allows dynamic Role strings ('STUDENT', 'FACULTY') and pending/approval states.
- **Department Class:** Maps 1-to-* with both the Course Class and Faculty Class.
- **Notice Class:** Contains target scopes (STUDENT/FACULTY) and Priority variants (NORMAL/IMPORTANT).

### 6.1.3 Sequence Diagram Description (Attendance Marking Flow)
1. *Faculty Member* clicks 'Mark Attendance' -> Angular Router loads `AttendanceComponent`.
2. *Angular Service* dispatches `GET /api/courses/` with JWT Token Authorization Header to Django API.
3. *Django API* hits PostgreSQL via ORM and returns active assigned courses as JSON arrays.
4. *Faculty Member* modifies primeNG table rows toggling boolean `is_present` metrics per student row.
5. *Faculty Member* clicks 'Submit'. 
6. *Angular Service* iterates the grid and fires bulk `POST /api/attendance/` payloads.
7. *Django API* validates payload shapes, ensures dates aren't strictly overlapping violently, and registers to PostgreSQL.
8. HTTP 201 Created is returned. Angular triggers a success Toast Notification UI on the Faculty's machine.

## 6.2 Entity Relationship (E-R) Diagram Description
*(Draft this explicitly in a full-page landscape view in MS Word)*
- **Entity:** `DEPARTMENT`
  - Attributes: id (PK), name, code, hod
  - Relationship: *has many* COURSES, *accommodates many* FACULTIES
- **Entity:** `COURSE`
  - Attributes: id (PK), name, code, semester, credit
  - Relationship: *enrolled in by many* STUDENTS
- **Entity:** `STUDENT`
  - Attributes: id (PK), name, semester, gpa, register_number
- **Entity:** `EXAMINATION`
  - Attributes: id (PK), exam_date, max_marks, document_link
  - Relationship: *conducted for a* COURSE, *invigilated by a* FACULTY

---

# 7. DATA DICTIONARY
A Data Dictionary is crucial for an ERP system with a dense database architecture to define every data type and constraint explicitly. 
*(Create extended MS Word Tables for each of these in your document to heavily expand page length)*

## 7.1 Table: core_user (Extended Abstract)
| Field Name | Type | Key | Null | Default | Description |
|---|---|---|---|---|---|
| id | Integer | PK | No | Auto | Primary Identifer generated sequentially |
| username | Varchar(150) | UNIQ | No | None | Contains uniquely formatted registration strings (e.g., PCMKPM2025001) |
| password | Varchar(128) | - | No | None | PBKDF2 hashed cryptographic string |
| is_active | Boolean | - | No | True | Core authorization boolean restricting login if false |
| role | Varchar(30) | - | No | None | Distinguishes ADMIN/FACULTY/STUDENT logic routing |

## 7.2 Table: api_department
| Field Name | Type | Key | Null | Default | Description |
|---|---|---|---|---|---|
| id | BigInt | PK | No | Auto | Unique increment index |
| name | Varchar(100) | - | No | None | E.g., Computer Science, Mathematics |
| code | Varchar(10) | UNIQ | No | None | Critical shorthand identifier (e.g., CS) |
| hod | Varchar(100) | - | Yes| None | Appointed Head of Department name string |

## 7.3 Table: api_course
| Field Name | Type | Key | Null | Default | Description |
|---|---|---|---|---|---|
| id | BigInt | PK | No | Auto | Primary Course Identifier |
| code | Varchar(20) | UNIQ | No | None | E.g., CS101, MAT202 |
| name | Varchar(100) | - | No | None | Subject Title string |
| semester | Integer | - | No | 1 | Academic block index integer |
| department_id| BigInt | FK | No | None | Relational mapping to api_department |
| allocated_faculty_id | BigInt| FK | Yes| Null | Maps specific course to single API_FACULTY instructor |

## 7.4 Table: api_student
| Field Name | Type | Key | Null | Default | Description |
|---|---|---|---|---|---|
| id | BigInt | PK | No | Auto | Unique Student Profile ID |
| student_id | Varchar(20) | UNIQ | No | None | Registration number |
| name | Varchar(100) | - | No | None | Full legal student string |
| gpa | Float | - | No | 0.0 | Academic metric dynamically calculated by Exam scripts |
| attendance | Float | - | No | 0.0 | Voluntarily shifting percentage metric based on boolean matrices |

## 7.5 Table: api_notice
| Field Name | Type | Key | Null | Default | Description |
|---|---|---|---|---|---|
| id | BigInt | PK | No | Auto | Notice distinct integer |
| title | Varchar(200) | - | No | None | Bold header rendering on dashboard grids |
| description| Text | - | No | None | Rich text paragraph contents detailing announcement details |
| target_role| Varchar(10) | - | No | BOTH | Enum restriction (STUDENT, FACULTY, BOTH) |
| priority | Varchar(10) | - | No | NORMAL| Enum restriction (NORMAL, IMPORTANT alerting styling) |

---

# 8. IMPLEMENTATION & CODING SEGMENTS
The backend is established using highly object-oriented and structural code. The usage of API Views and Serializers isolates logic robustly.
*(Expand this section across 10 pages in MS Word by printing out comprehensive scripts)*

## 8.1 Backend API Models (`models.py`)
This script represents the foundational translation from Python object relationships immediately to PostgreSQL relational schemas.

```python
from django.db import models
from django.contrib.auth.models import User
import random, string

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    hod = models.CharField(max_length=100, null=True, blank=True)
    established = models.CharField(max_length=4, null=True, blank=True)
    status = models.CharField(max_length=20, default='Active')

    def __str__(self):
        return self.name

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    semester = models.IntegerField(default=1)
    credits = models.IntegerField(default=3)
    allocated_faculty = models.ForeignKey('Faculty', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class RegistrationRequest(models.Model):
    ROLE_CHOICES = [('STUDENT', 'Student'), ('FACULTY', 'Faculty')]
    STATUS_CHOICES = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    full_name = models.CharField(max_length=150)
    email = models.EmailField(null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
```

## 8.2 Frontend Typescript Logic (`notices.component.ts`)
This segment of the Angular SPA architecture captures HTTP payloads directly from the Django Server arrays and pushes them into an interactive DOM Component rendering engine.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoticeService } from '../../../core/services/notice.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss'],
  providers: [MessageService]
})
export class NoticesComponent implements OnInit {
  notices: any[] = [];
  noticeForm: FormGroup;
  displayDialog: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private noticeService: NoticeService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.noticeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      target_role: ['BOTH', Validators.required],
      priority: ['NORMAL']
    });
  }

  ngOnInit() {
    this.loadNotices();
    const role = this.authService.getUserRole();
    this.isAdmin = role === 'ADMIN';
  }

  loadNotices() {
    this.noticeService.getNotices().subscribe(
      res => this.notices = res,
      err => this.showError('Fetch Failed')
    );
  }

  deleteNotice(id: number) {
     if(!this.isAdmin) return;
     this.noticeService.deleteNotice(id).subscribe(() => {
        this.notices = this.notices.filter(n => n.id !== id);
        this.showSuccess('Notice deleted actively!');
     });
  }
}
```
