import os
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from fileservice.models import FileShare

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Clean up expired files and database records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force cleanup of all downloaded files regardless of expiry',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        self.stdout.write(self.style.SUCCESS('Starting file cleanup...'))
        
        # Find expired files
        if force:
            expired_files = FileShare.objects.filter(is_downloaded=True)
            self.stdout.write(f'Force mode: Found {expired_files.count()} downloaded files')
        else:
            expired_files = FileShare.objects.filter(
                expires_at__lt=timezone.now()
            )
            self.stdout.write(f'Found {expired_files.count()} expired files')
        
        deleted_files_count = 0
        deleted_records_count = 0
        errors = []
        
        for file_obj in expired_files:
            try:
                # Delete physical file
                file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
                
                if os.path.exists(file_path):
                    if not dry_run:
                        os.remove(file_path)
                        deleted_files_count += 1
                    self.stdout.write(
                        f'{"Would delete" if dry_run else "Deleted"} file: {file_obj.original_filename} ({file_obj.code})'
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'File not found on disk: {file_obj.original_filename} ({file_obj.code})')
                    )
                
                # Delete database record
                if not dry_run:
                    file_obj.delete()
                    deleted_records_count += 1
                
            except Exception as e:
                error_msg = f'Error processing {file_obj.code}: {str(e)}'
                errors.append(error_msg)
                self.stdout.write(self.style.ERROR(error_msg))
        
        # Clean up orphaned files
        self.stdout.write('\nCleaning up orphaned files...')
        orphaned_count = self._cleanup_orphaned_files(dry_run)
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n--- Cleanup Summary ---'))
        if dry_run:
            self.stdout.write(f'Would delete {expired_files.count()} database records')
            self.stdout.write(f'Would delete {deleted_files_count} files from disk')
        else:
            self.stdout.write(f'Deleted {deleted_records_count} database records')
            self.stdout.write(f'Deleted {deleted_files_count} files from disk')
        
        self.stdout.write(f'Found and {"would clean" if dry_run else "cleaned"} {orphaned_count} orphaned files')
        
        if errors:
            self.stdout.write(self.style.ERROR(f'\nErrors encountered: {len(errors)}'))
            for error in errors:
                self.stdout.write(self.style.ERROR(f'  - {error}'))
        
        self.stdout.write(self.style.SUCCESS('Cleanup completed!'))

    def _cleanup_orphaned_files(self, dry_run=False):
        """Clean up files that exist on disk but not in database"""
        if not os.path.exists(settings.MEDIA_ROOT):
            self.stdout.write(self.style.WARNING('Media directory does not exist'))
            return 0
        
        # Get all file paths from database
        db_files = set(FileShare.objects.values_list('file_path', flat=True))
        
        # Get all files from uploads directory
        uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        if not os.path.exists(uploads_dir):
            return 0
        
        orphaned_count = 0
        
        for root, dirs, files in os.walk(uploads_dir):
            for file in files:
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, settings.MEDIA_ROOT)
                
                if relative_path not in db_files:
                    orphaned_count += 1
                    if not dry_run:
                        try:
                            os.remove(full_path)
                            self.stdout.write(f'Deleted orphaned file: {relative_path}')
                        except OSError as e:
                            self.stdout.write(
                                self.style.ERROR(f'Error deleting orphaned file {relative_path}: {e}')
                            )
                    else:
                        self.stdout.write(f'Would delete orphaned file: {relative_path}')
        
        return orphaned_count