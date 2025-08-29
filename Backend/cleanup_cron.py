#!/usr/bin/env python3
"""
Cron job script for PythonAnywhere to clean up expired files.
Add this to your PythonAnywhere scheduled tasks to run every 5 minutes.

Instructions for PythonAnywhere:
1. Go to your PythonAnywhere dashboard
2. Click on "Tasks" tab
3. Create a new scheduled task
4. Set command: python3.10 /home/yourusername/mysite/cleanup_cron.py
5. Set schedule: */5 * * * * (every 5 minutes)
"""

import os
import sys
import django

# Add your project directory to Python path
# Replace '/home/yourusername/mysite' with your actual project path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(PROJECT_ROOT)

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fileshare_backend.settings')
django.setup()

# Now we can import Django models
from django.core.management import call_command

if __name__ == '__main__':
    try:
        # Run the cleanup command
        call_command('cleanup_files', verbosity=1)
        print("File cleanup completed successfully")
    except Exception as e:
        print(f"Error during cleanup: {e}")
        sys.exit(1)