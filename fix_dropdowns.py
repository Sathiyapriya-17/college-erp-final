import os
files = [
    r"f:\College-erp-final\src\app\layout\header\header.component.html",
    r"f:\College-erp-final\src\app\features\notices\notices.component.html",
    r"f:\College-erp-final\src\app\features\hr\faculty-management.component.html",
    r"f:\College-erp-final\src\app\features\examinations\examinations.component.html",
    r"f:\College-erp-final\src\app\features\auth\contact-admin\contact-admin.component.html",
    r"f:\College-erp-final\src\app\features\admissions\admissions.component.html",
    r"f:\College-erp-final\src\app\features\admin\department-config\department-config.component.html",
    r"f:\College-erp-final\src\app\features\academics\timetable\timetable.component.html",
    r"f:\College-erp-final\src\app\features\academics\students\students.component.html",
    r"f:\College-erp-final\src\app\features\academics\curriculum\curriculum.component.html",
    r"f:\College-erp-final\src\app\features\academics\attendance\attendance-recording.component.html",
    r"f:\College-erp-final\src\app\features\academics\course-assignment\course-assignment.component.html"
]

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        blocks = new_content.split('<p-dropdown ')
        if len(blocks) > 1:
            result = blocks[0]
            for block in blocks[1:]:
                tag_attrs = block.split('>', 1)[0]
                mod_block = block
                if 'appendTo=' not in tag_attrs:
                    mod_block = 'appendTo="body" ' + mod_block
                if 'w-full' not in tag_attrs:
                    mod_block = 'styleClass="w-full" ' + mod_block
                result += '<p-dropdown ' + mod_block
            
            if result != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(result)
                print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error {filepath}: {e}")
