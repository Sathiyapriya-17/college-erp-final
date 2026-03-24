# PART 1: INTRODUCTION, LITERATURE REVIEW, & SYSTEM ANALYSIS
*(Note: To achieve 60 pages in MS Word, use Times New Roman, size 12, with 1.5 line spacing. Each major heading should start on a new page. Include large diagrams and screenshots where indicated.)*

---

# 1. INTRODUCTION

## 1.1 Overview
The **College Enterprise Resource Planning (ERP) System** is an advanced, fully integrated, robust web-based software platform designed explicitly to centralize and automate the day-to-day operations of an educational institution. Traditionally, colleges and universities have relied extensively on manual, paper-based processes or disjointed digital tools (like standalone Excel sheets or legacy desktop software) to manage their administrative, academic, and financial functions. Such decentralized approaches often lead to severe data redundancy, inconsistent communication, security vulnerabilities, and massive losses in productivity among staff and faculty members. 

In the modern digital era, the reliance on such antiquated methods poses a significant bottleneck to institutional scalability and transparency. The proposed College ERP System seeks to address these challenges by providing a unified, centralized digital ecosystem. It connects the Administrator, Department Heads (HODs), Faculty Members, and Students into a cohesive network. By implementing this ERP, Pachaiyappa's College for Men can transition into a paperless, real-time data environment, enabling instantaneous decision-making and vastly improving the overall educational experience.

## 1.2 Purpose of the Project
The primary objective of this project is to develop and deploy an intelligent web application that automates:
1. **User Identity & Access Management:** Secure sign-on and automated onboarding for students and staff.
2. **Academic Scheduling:** Dynamic allocation of courses to faculty members.
3. **Attendance Tracking:** Course-wise and date-wise attendance logging with automated shortage alerts.
4. **Examination Management:** Seamless scheduling of internal and external exams, capturing of marks, and automated CGPA computation.
5. **Instant Communication:** A centralized digital Notice Board preventing information silos.
6. **User Preferences:** Allowing end-users to customize their digital campus experience via UI themes and profile adjustments.

## 1.3 Scope of the Project
The scope of the College ERP System encompasses the entire academic administration lifecycle. It begins from the moment a student or faculty member is registered into the database and spans across their daily interactions—such as viewing timetables, logging attendance, tracking academic performance, and receiving critical broadcasts. 

While the current release focuses heavily on Core Academics (Attendance and Examinations) and HR Administration (Faculty allocation and User Management), the architecture is designed as a modular **Single Page Application (SPA)** backed by RESTful APIs. This means the scope can easily be expanded in the future to incorporate advanced modules like Library Management, Transport Management, and integrated Payment Gateways for fee collection, without requiring a complete overhaul of the existing system.

## 1.4 Organization Profile
**Pachaiyappa’s College for Men, Kanchipuram**, is a historic and premier educational institution renowned for its commitment to providing high-quality higher education. Established with a profound vision to uplift the student community through a knowledge-driven society, the college continuously encourages both its faculty and student body to engage in technological innovations. The institution boasts robust departments spanning Computing, Sciences, and Arts. By developing this College ERP System internally for partial fulfillment of the M.Sc. (Computer Science) degree, the institution reinforces its commitment to self-reliance, modernization, and the practical application of cutting-edge software engineering principles within its very own operational framework.

---

# 2. LITERATURE REVIEW / TECHNOLOGY STACK

To build a modern web application capable of handling high concurrent traffic securely, an exhaustive literature review of contemporary software architectures was conducted. The decision to employ the **MVT (Model-View-Template/API)** and **Component-Based Architecture** stems from industry best practices.

## 2.1 Frontend: Angular & TypeScript
**Angular** is a platform and framework developed by Google for building single-page client applications using HTML and TypeScript. It implements core and optional functionality as a set of TypeScript libraries that you import into your apps. 
- **Component-Based Architecture:** Angular applications consist of a tree of distinct UI components, making the codebase highly reusable and modular.
- **Two-Way Data Binding:** This significantly reduces the boilerplate code developers have to write, ensuring the model and the view are always synchronized.
- **Dependency Injection:** Angular’s DI framework provides components with the services they need, maximizing efficiency and testability.

## 2.2 Backend: Python, Django & DRF
**Django** is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It is built by experienced developers and takes care of much of the hassle of web development.
- **Django REST Framework (DRF):** A powerful and flexible toolkit for building Web APIs. DRF was chosen for its robust serialization engine (converting complex Django QuerySets into native Python datatypes, which are then rendered into JSON arrays for the Angular frontend).
- **ORM (Object-Relational Mapping):** Django’s built-in ORM interacts directly with the PostgreSQL database, meaning database queries are written in Python code rather than raw SQL, greatly reducing the risk of SQL injection attacks and improving maintainability.

## 2.3 Database Ecosystem: PostgreSQL
**PostgreSQL** is an advanced, enterprise-class, open-source relational database system. It was selected over lightweight alternatives like SQLite or MySQL due to its superior handling of complex queries, strong adherence to SQL standards, and exceptional data integrity mechanisms. In an ERP context where transactional consistency (e.g., logging attendance strings and exam marks simultaneously) is paramount, PostgreSQL ensures ACID (Atomicity, Consistency, Isolation, Durability) compliance.

## 2.4 UI/UX Framework: PrimeNG
**PrimeNG** is a rich set of open-source UI components for Angular. Utilizing PrimeNG allowed rapid prototyping of complex data-tables (crucial for attendance and exams grids), dynamic dropdown menus mapping to the body, and aesthetic theming.

---

# 3. SYSTEM ANALYSIS

## 3.1 Existing System Overview
The existing infrastructure at many traditional educational institutions relies heavily on disconnected mechanisms.
- **Student Information:** Stored in physical filing cabinets or localized Excel spreadsheets that are isolated from other departments.
- **Attendance Management:** Relies on physical paper registers passed around during lectures. These registers are calculated manually at the end of the month by clerical staff.
- **Notices:** Physical paper circulars pinned to wooden notice boards, often missed by absentees.
- **Examinations:** Question papers and marks are tracked locally by individual professors, making centralized result generation a logistical nightmare.

### 3.1.1 Drawbacks of the Existing System
1. **High Error Margins:** Manual data entry frequently results in typographical errors affecting student grades and attendance metrics.
2. **Time Consumption:** Compiling reports across multiple departments commands exhausting hours of administrative labor.
3. **Data Security Risks:** Physical records are susceptible to damage by fire, water, or misplacement. Local Excel sheets lack robust access control, posing a risk of unauthorized alterations.
4. **Communication Gaps:** Students depend entirely on physical presence or third-party messaging apps to stay updated on critical academic deadlines.

## 3.2 Problem Definition
The primary problem identified is the lack of a cohesive, secure, and automated digital ledger. The college urgently requires a system that unifies disparate administrative operations into a single pane of glass. The problem mandates a solution that:
- Restricts unauthorized access through strict Role-Based Access Control (RBAC).
- Allows Faculties to input variables (marks, attendance) dynamically from any device.
- Computes complex metrics (like semester GPA and total attendance percentage) instantly without human intervention.
- Centralizes the dissemination of academic announcements.

## 3.3 Proposed System
The newly proposed **College ERP System** is a radical digital shift. It is engineered to perform all academic operations in the cloud, utilizing a responsive SPA frontend and a highly secure REST API backend.
- **Automated Operations:** Registration workflows generate predictable but secure credentials (e.g., PCMKPM+Year+ID).
- **Dynamic Dashboards:** Every user (Admin, HOD, Faculty, Student) logs into a customized dashboard that exclusively displays metrics and tools relevant to their specific role.
- **Real-Time Data Processing:** The moment a faculty member marks a student 'Absent' physically in a class, the backend instantly updates the database and reflects the changed percentage on the student's personal portal.

### 3.3.1 Advantages of the Proposed System
- **Total Data Integrity:** Elimination of duplicate records. All modules pull from the same central PostgreSQL database schema.
- **Instant Reporting:** HODs and Administrators can generate attendance and grade reports in microseconds.
- **Accessibility:** Being a web application, it is universally accessible via standard web browsers (Chrome, Edge, Firefox) across desktops, tablets, and smartphones.
- **Eco-Friendly:** Drastically reduces the institution's dependency on paper trails.

---

# 4. FEASIBILITY STUDY

A feasibility study assesses the practicality of the proposed project system. It analyzes whether the system is technically, economically, and operationally viable.

## 4.1 Technical Feasibility
The software relies on mature, battle-tested technologies. 
- The deployment can be supported by any standard cloud provider (AWS, Azure, DigitalOcean) running a Linux instance. 
- The DRF API handles heavy request loads gracefully, and Angular optimizes client-side rendering. 
- **Conclusion:** The project is technically highly feasible, as there are no unprecedented hardware requirements or proprietary software licenses needed.

## 4.2 Economic Feasibility
The development of this software incurs zero licensing costs because Angular, Python, Django, DRF, and PostgreSQL are all open-source. 
- The main costs involve eventual cloud server hosting and domain registration.
- Economically, the ERP will yield a massive Return on Investment (ROI) by drastically reducing stationary costs (paper, ink, hardware registers) and minimizing the human man-hours previously wasted on clerical data compilation.
- **Conclusion:** The system is highly economically feasible.

## 4.3 Operational Feasibility
The system has been purpose-built with intuitive GUI elements sourced from PrimeNG. 
- Complex operations like assigning a faculty to a course require simple point-and-click dropdown interactions.
- Minimal technical training is required for end-users (teachers and students).
- The transition from manual to digital can be executed smoothly over a single academic semester.
- **Conclusion:** The system holds high operational feasibility.

## 4.4 Schedule / Time Feasibility
The project strictly adheres to an agile methodology. 
- Phase 1: Requirement Gathering & Database Schema Design (Completed).
- Phase 2: Backend API Development (Completed).
- Phase 3: Frontend Component Integration (Completed).
- Phase 4: System Testing & Final M.Sc. Project Submission (April 2026).
- **Conclusion:** Schedule feasibility is well within the academic semester timeframe.

---

# 5. SOFTWARE REQUIREMENT SPECIFICATION (SRS)

## 5.1 Overview
This SRS adheres to the IEEE standards, documenting the comprehensive behavioral parameters of the College ERP System.

## 5.2 Hardware Interfaces
### For Server Deployment:
- **Processor:** Minimum 4 Cores (Intel Xeon or AMD EPYC equivalent).
- **RAM:** Minimum 8GB (Recommended 16GB for production).
- **Storage:** Minimum 256GB SSD (Solid State Drive for rapid DB queries).
- **Network:** High-speed Gigabit Ethernet connection.

### For Client Machines (End-Users):
- Any computing device (Desktop, Laptop, Smartphone) equipped with at least 2GB of RAM.
- A functional Internet or Intranet connection.

## 5.3 Software Interfaces
- **Operating System:** Cross-platform on the client edge (Windows, macOS, iOS, Android). Server edge typically uses Linux (Ubuntu 22.04 LTS).
- **Web Server:** Gunicorn serving the Django application, reverse proxied by Nginx.
- **Database:** PostgreSQL v14.0 or higher.
- **Client Brower Requirements:** HTML5 and ES6 JavaScript-compatible browsers (Google Chrome 90+, Mozilla Firefox 88+, Safari 14+).

## 5.4 Functional Requirements
1. **REQ-AUTH-01:** The system MUST authenticate users and generate a JSON Web Token (JWT) bearing their distinct role claims.
2. **REQ-ADMIN-01:** Administrators MUST possess exclusive rights to approve newly registered user accounts and auto-generate their credentials.
3. **REQ-ATT-01:** The system MUST allow Faculty to invoke a date-wise attendance grid mapped only to courses they are assigned.
4. **REQ-EXM-01:** Heads of Department (HODs) MUST be able to schedule internal examinations, linking Google Forms to the UI.
5. **REQ-EXM-02:** Faculty MUST be able to manually override/input marks for students after Google Form evaluation.
6. **REQ-NOT-01:** Administrators MUST be able to generate priority-based Notices that render on the global dashboards of students and faculty.
7. **REQ-PREF-01:** Users MUST be able to select customized PrimeNG UI themes that persist across sessions.

## 5.5 Non-Functional Requirements
1. **Scalability:** The architecture MUST support future addition of new RESTful endpoints without breaking existing contracts.
2. **Security:** Passwords MUST be hashed utilizing the PBKDF2 algorithm inherently supported by Django. All HTTP traffic must be encrypted via SSL/TLS in production (HTTPS).
3. **Availability:** The application MUST target an uptime of 99.9% during standard college operational hours.
4. **Maintainability:** Codebases MUST follow strict structural paradigms. Angular components must isolate TS logic from HTML templates. Django apps must isolate Models from Views.
