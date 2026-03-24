import subprocess
import os

def run_diag():
    cmds = [
        [r"F:\College-erp-final\backend\venv\Scripts\python.exe", "manage.py", "makemigrations"],
        [r"F:\College-erp-final\backend\venv\Scripts\python.exe", "manage.py", "migrate"]
    ]
    outputs = []
    for cmd in cmds:
        try:
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = process.communicate(timeout=60)
            outputs.append(f"COMMAND: {' '.join(cmd)}\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}\nEXIT CODE: {process.returncode}\n")
        except Exception as e:
            outputs.append(f"EXCEPTION for {' '.join(cmd)}: {e}\n")
    
    with open("diag_output.txt", "w") as f:
        f.writelines(outputs)

if __name__ == "__main__":
    run_diag()
