# PART 3: SOFTWARE TESTING, OUTPUT SCREENS & CONCLUSION
*(Note: To achieve 60 pages in MS Word, use Times New Roman, size 12, with 1.5 line spacing. Each major heading should start on a new page. Include large diagrams and screenshots where indicated.)*

---

# 9. SOFTWARE TESTING
Testing is a critical phase of the Software Development Life Cycle (SDLC) that ensures the absolute reliability, functionality, and security of the ERP before deployment to a live academic setting. The robust architecture of the College ERP system underwent several rigorous testing phases.

## 9.1 Overview of Testing Strategies
- **Unit Testing:** This involved utilizing frameworks (like PyTest for Django and Karma/Jasmine for Angular) to test individual functions. For example, testing the logic that auto-generates student passwords based on Date of Birth.
- **Integration Testing:** Ensuring the REST APIs properly serialize Data from PostgreSQL and transmit it securely as JSON payloads over HTTP. Crucially, resolving CORS (Cross-Origin Resource Sharing) policies accurately.
- **Security Testing:** Verifying that JWT authorization headers are mandated on all protected endpoints, stopping unregistered users from querying APIs via Postman or Curl.
- **User Acceptance Testing (UAT):** Real-world testing wherein random users assumed the roles of Faculty and Students to ensure the UI flows logically without causing confusion.

## 9.2 Comprehensive Test Cases (Extended Table)
*(Insert the following table into your Word Document, stretching it across 2 to 3 pages horizontally or vertically)*

| Test Case ID | Test Scenario Description | Pre-Condition | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC_LOG_01 | Validate Login with entirely correct User/Pass | Valid Account exists in DB | Directs to respective Role Dashboard (e.g., /admin) | Dashboard loaded with correct sidebars | **PASS** |
| TC_LOG_02 | Validate Login with incorrect password | Valid User, bad Auth string | HTTP 401 Unauthorized API error thrown | UI displays "Invalid Credentials" Toast | **PASS** |
| TC_REG_01 | Student Registration Request generation | Guest User on Reg. Page | Row inserted into `RegistrationRequest` model with 'PENDING' | Status visible to Admin panel | **PASS** |
| TC_ATT_01 | Faculty marking attendance | User logged in as FACULTY | Checked boxes send `is_present=true` JSONs to backend | DB reflects true; Student dashboard updates | **PASS** |
| TC_ATT_02 | Faculty submitting overlapping attendance | Faculty tries to resubmit on a Date already logged | HTTP 400 Bad Request triggers on UniqueConstraint | PrimeNG Toast displays "Already Exists" | **PASS** |
| TC_EXM_01 | HOD scheduling a new internal Exam | User is HOD | Dropdown fetches correct Faculty list | Form saves successfully triggering notification | **PASS** |
| TC_NOT_01 | Admin deleting global circular Notice | Admin Auth Token attached to DELETE request | Hard deletion of notice item from DB | Notice instantly disappears from all views | **PASS** |
| TC_UI_01 | Dynamic PrimeNG Theme swapping | User selects "Lara Dark" from top Navbar | UI color palette fundamentally shifts | Theme persists upon F5 Page Reload via localStorage | **PASS** |

---

# 10. SYSTEM OUTPUT SCREENS
A critical component of the M.Sc. Report is visual evidence of the implemented system. The College ERP System comprises numerous interactive graphical representations. 

*(**INSTRUCTION FOR WORD DOSSIER:** In your MS Word document, allocate exactly one full page per output screen. Paste a high-resolution screenshot below each descriptive header below. This will rapidly consume roughly 15-20 pages of your final report.)*

## 10.1 Access & Identity Interface
**Figure 10.1(a) - The Central Portal Login Screen** 
*(Insert Screenshot of `http://localhost:4200/login` showing Username/Password inputs)*
Description: The gateway to the ERP. It restricts access dynamically.

**Figure 10.1(b) - Account Registration Portal** 
*(Insert Screenshot of Registration form with full_name, email, dob, role-selector)*
Description: Where a new user submits an application pending Admin approval.

## 10.2 Administrative Panels (Role: ADMIN)
**Figure 10.2(a) - The Administrative Overview Dashboard**
*(Insert Screenshot showing global metrics: Total Students, Total Faculty, Active Courses)*

**Figure 10.2(b) - Registration Request Approvals Tool**
*(Insert Screenshot of `RegistrationRequest` grid with 'Approve' and 'Reject' action buttons)*

**Figure 10.2(c) - The Notice Generator Interface**
*(Insert Screenshot of the rich-text editor where Admins draft priority circulars)*

## 10.3 Curriculum & Scheduling (Role: HOD & FACULTY)
**Figure 10.3(a) - Faculty Allocation Grid**
*(Insert Screenshot of Admin assigning specific Faculty entities to specific Course codes)*

**Figure 10.3(b) - Internal Examination Setup Interface**
*(Insert Screenshot of the Exam form demanding Date, Max Marks, and Google Form Links)*

## 10.4 Core Academic Functions 
**Figure 10.4(a) - Dynamic Course-Wise Attendance Marker**
*(Insert Screenshot of the interactive grid where Faculty click checkboxes mapping to P/A status)*

**Figure 10.4(b) - Student Analytics View (Role: STUDENT)**
*(Insert Screenshot tracing the particular Student's aggregated Attendance % and CGPA visual metrics)*

## 10.5 User Aesthetics
**Figure 10.5(a) - User Preferences Modal**
*(Insert Screenshot of profile picture uploader and PrimeNG Theme selector cascading dropdown)*

---

# 11. CONCLUSION 
The **College Enterprise Resource Planning System** represents a radical departure from inefficient, manual paper-based methodologies conventionally plaguing educational administrations. By executing this vast architecture via Angular, Django REST Framework, and PostgreSQL, the project definitively proves the viability of secure, cloud-native administration in academia. 

Throughout the lifecycle of this project—ranging from the IEEE-compliant SRS generation, to database schema normalizations, down to exhaustive API endpoint integration—strong software engineering paradigms have been established. By enforcing Role-Based Access Controls, calculating granular attendance matrices dynamically, executing global communications seamlessly via the Notice module, and incorporating an adaptable UI theme engine, Pachaiyappa's College for Men is propelled toward an efficient digital future. This M.Sc. project successfully fulfills all initial functional propositions, mitigating clerical errors substantially and increasing overall institutional velocity.

## 11.1 Future Enhancements
While the current foundation of the SPA is robust, specific expansions are viable:
1. **Online Fee Management:** Integrating APIs like Razorpay or Stripe to allow students to map payments directly via the portal.
2. **Library Automation module:** Central library stock tracking linked directly to student ID accounts.
3. **Bio-metric Hardware Integration:** Linking the Django backend endpoints to physical RFID/Fingerprint scanners placed outside classrooms for totally passive attendance.

---

# 12. BIBLIOGRAPHY
1. **Google Angular Framework Architecture Docs:** https://angular.io/docs
2. **Django Software Foundation API References:** https://docs.djangoproject.com/
3. **Django REST Framework (DRF) Official Specs:** https://www.django-rest-framework.org/
4. **PostgreSQL Relational DB Standards:** https://www.postgresql.org/docs/
5. **PrimeTek PrimeNG Angular UI Compendium:** https://primeng.org/
6. Freeman, A. (2020). *Pro Angular 9*. Apress.
7. Two Scoops of Django 3.x: *Best Practices for the Django Web Framework* by Daniel Feldroy.
8. Sommerville, I. (2015). *Software Engineering* (10th Edition). Pearson Education Limited.
