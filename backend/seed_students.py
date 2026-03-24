import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Department, Student, Course, Fee, Attendance, TimetableEntry, Faculty
from datetime import date, timedelta

def seed_data():
    # 1. Create Department
    dept, _ = Department.objects.get_or_create(
        code='MSCCS',
        defaults={'name': 'MSc Computer Science', 'status': 'Active'}
    )

    # 2. Create Faculty (for attendance/timetable)
    faculty, _ = Faculty.objects.get_or_create(
        faculty_id='FAC001',
        defaults={'name': 'Dr. Arulmani', 'department': dept, 'designation': 'Professor'}
    )

    # 3. Create Courses for MSc CS 2nd Year (Sem 4)
    courses_data = [
        {'code': 'CS401', 'name': 'Advanced Algorithms', 'credits': 4},
        {'code': 'CS402', 'name': 'Cloud Computing', 'credits': 4},
        {'code': 'CS403', 'name': 'Machine Learning', 'credits': 4},
    ]
    courses = []
    for c_data in courses_data:
        course, _ = Course.objects.get_or_create(
            code=c_data['code'],
            defaults={'name': c_data['name'], 'department': dept, 'credits': c_data['credits']}
        )
        courses.append(course)

    # 4. Student Names from User Request
    student_names = [
        "Sathiyapriya", "Logeshwari", "Dhivya Bhatathi", "Preetha",
        "Jayashalini", "Shivaranjini", "Mahalakshmi", "Srreelekha",
        "Lavanya", "Sowmiya", "Kokiala", "Umamaheshwari"
    ]

    print(f"Seeding {len(student_names)} students...")

    for i, name in enumerate(student_names, 1):
        username = name.lower().replace(" ", "")
        student_id = f"STU2024{i:03d}"
        
        # Create User
        user, created = User.objects.get_or_create(
            username=student_id,
            defaults={'first_name': name, 'is_staff': False}
        )
        if created:
            print(f"Created new user: {student_id}")
        user.set_password("Password123")
        user.save()

        # Create Student Profile
        student, _ = Student.objects.update_or_create(
            student_id=student_id,
            defaults={
                'user': user,
                'name': name,
                'department': dept,
                'semester': 4,
                'gpa': 8.5,
                'attendance': 90.0,
                'status': 'Excellent'
            }
        )

        # Create Fee Status
        Fee.objects.get_or_create(
            student=student,
            amount=50000.00,
            defaults={'due_date': date.today() + timedelta(days=30), 'is_paid': i % 2 == 0}
        )

        # Create some mock attendance
        for course in courses:
            Attendance.objects.get_or_create(
                student=student,
                course=course,
                date=date.today() - timedelta(days=1),
                defaults={'is_present': True, 'marked_by': faculty}
            )

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
