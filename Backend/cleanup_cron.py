#!/usr/bin/env python3

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
