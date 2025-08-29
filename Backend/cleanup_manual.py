#!/usr/bin/env python3
"""
Manual cleanup script for file sharing service.
Run this script to manually clean up expired files and database records.

Usage:
python cleanup_manual.py              # Normal cleanup of expired files
python cleanup_manual.py --dry-run    # Show what would be deleted
python cleanup_manual.py --force      # Force cleanup of all downloaded files
"""

import os
import sys
import django
import argparse

# Setup Django environment
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(PROJECT_ROOT)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fileshare_backend.settings')
django.setup()

from django.core.management import call_command

def main():
    parser = argparse.ArgumentParser(description='Manual file cleanup for file sharing service')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be deleted without actually deleting')
    parser.add_argument('--force', action='store_true', help='Force cleanup of all downloaded files regardless of expiry')
    
    args = parser.parse_args()
    
    try:
        # Build command arguments
        cmd_args = ['cleanup_files']
        if args.dry_run:
            cmd_args.append('--dry-run')
        if args.force:
            cmd_args.append('--force')
        
        # Run the cleanup command
        call_command(*cmd_args)
        print("\nCleanup operation completed successfully!")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()