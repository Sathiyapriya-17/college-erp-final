import os
import django

print("--- Script Started ---")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from api.models import Student

def diagnostic():
    usernames = ['STU2024001', 'sathiyapriya', 'Sathiyapriya']
    password = 'Password123'
    
    with open("auth_results.txt", "w") as f:
        f.write("--- Diagnostic Results ---\n")
        for username in usernames:
            f.write(f"\n--- Diagnostic for {username} ---\n")
            user = User.objects.filter(username=username).first()
            if user:
                f.write(f"User exists: YES\n")
                f.write(f"User Active: {user.is_active}\n")
                
                # Ensure password is correct for testing
                user.set_password(password)
                user.save()
                f.write(f"Password reset to '{password}' for {username}\n")
                
                # Test auth
                auth_user = authenticate(username=username, password=password)
                if auth_user:
                    f.write("Authenticate returns: SUCCESS\n")
                else:
                    f.write("Authenticate returns: FAILURE (Incorrect password or inactive)\n")
                
                student = Student.objects.filter(user=user).first()
                if student:
                    f.write(f"Linked Student profile: YES ({student.name})\n")
                else:
                    f.write("Linked Student profile: NO\n")
            else:
                f.write(f"User exists: NO\n")
            
        f.write("\n--- Listing first 5 users ---\n")
        for u in User.objects.all()[:5]:
            f.write(f"- {u.username}\n")

if __name__ == "__main__":
    diagnostic()
