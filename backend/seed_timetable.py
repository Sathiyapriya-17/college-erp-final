import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth.models import User
from api.models import Department, Faculty, Course, TimetableEntry

def run_seed():
    print("Starting timetable seed...")

    # 1. Create or get Department
    dept, _ = Department.objects.get_or_create(
        name="MSc Computer Science",
        defaults={"code": "MSC-CS", "status": "Active"}
    )
    print(f"Department ensured: {dept.name}")

    # 2. Create or get HOD User & Faculty profile
    hod_username = "hod_cs"
    user, created = User.objects.get_or_create(username=hod_username)
    if created:
        user.set_password("hod123")
        user.save()
        print(f"Created user: {hod_username}")
    else:
        # Guarantee password is set correctly for testing
        user.set_password("hod123")
        user.save()
        print(f"Updated password for user: {hod_username}")
    
    hod_faculty, _ = Faculty.objects.get_or_create(
        user=user,
        defaults={
            "name": "HOD Computer Science",
            "faculty_id": "FAC-HOD-CS",
            "email": "hod_cs@college.edu",
            "department": dept,
            "designation": "HOD"
        }
    )
    # Ensure designation is HOD
    if hod_faculty.designation != "HOD":
        hod_faculty.designation = "HOD"
        hod_faculty.save()
    print(f"HOD Faculty ensured: {hod_faculty.name}")

    # 3. Create Courses for Semester 4 mapping
    courses_data = [
        {"code": "CS-DIP", "name": "Digital Image Processing (DIP)", "credits": 3},
        {"code": "CS-DC", "name": "Data Communication (DC)", "credits": 3},
        {"code": "CS-BCT", "name": "Blockchain Technology (BCT)", "credits": 3},
        {"code": "CS-PROJ", "name": "Project Work", "credits": 6},
        {"code": "CS-DUMMY", "name": "Dummy Subject", "credits": 3},
    ]

    course_objs = {}
    for c in courses_data:
        course, _ = Course.objects.get_or_create(
            department=dept,
            code=c["code"],
            defaults={"name": c["name"], "credits": c["credits"]}
        )
        course_objs[c["code"]] = course
    print("Courses ensured.")

    # 4. Clear existing timetable entries for this department to avoid duplicates
    TimetableEntry.objects.filter(department=dept).delete()
    print("Cleared existing timetable entries for the department.")

    # 5. Define Time Slots
    time_slots = [
        '02:00 PM - 02:45 PM',
        '02:45 PM - 03:30 PM',
        '03:30 PM - 04:15 PM',
        '04:30 PM - 05:15 PM',
        '05:15 PM - 06:00 PM'
    ] # Notice: skipping break slot

    days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    # 6. Seed Semesters 1, 2, 3 with dummy data
    for sem in [1, 2, 3]:
        for day in days:
            # Add 2 dummy subjects per day
            for slot in [time_slots[0], time_slots[1]]:
                TimetableEntry.objects.create(
                    department=dept,
                    semester=sem,
                    day=day,
                    time_slot=slot,
                    course=course_objs["CS-DUMMY"],
                    faculty=hod_faculty,
                    room="Room 101"
                )
    print("Seeded Sem 1, 2, 3 with dummy data.")

    # 7. Seed Semester 4 with exact given timetable
    sem4_schedule = {
        'MON': ['CS-DIP', 'CS-DC', 'CS-DIP', 'CS-DC', 'CS-BCT'],
        'TUE': ['CS-PROJ', 'CS-PROJ', 'CS-PROJ', 'CS-PROJ', 'CS-PROJ'],
        'WED': ['CS-DC', 'CS-BCT', 'CS-DC', 'CS-DIP', 'CS-BCT'],
        'THU': ['CS-PROJ', 'CS-PROJ', 'CS-PROJ', 'CS-PROJ', 'CS-PROJ'],
        'FRI': ['CS-BCT', 'CS-DC', 'CS-DIP', 'CS-BCT', 'CS-DIP'],
        'SAT': ['CS-PROJ', 'CS-PROJ', 'CS-PROJ', 'CS-PROJ', 'CS-PROJ']
    }

    for day, courses in sem4_schedule.items():
        for i, course_code in enumerate(courses):
            if course_code:
                TimetableEntry.objects.create(
                    department=dept,
                    semester=4,
                    day=day,
                    time_slot=time_slots[i],
                    course=course_objs[course_code],
                    faculty=hod_faculty,
                    room="Lab 1" if course_code == 'CS-PROJ' else "Room 202"
                )
    print("Seeded Sem 4 with exact schedule.")
    print("Seed complete! You can login with username: hod_cs / password: hod123")

if __name__ == "__main__":
    run_seed()
