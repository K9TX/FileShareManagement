import os
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from .models import FileShare


@shared_task
def cleanup_expired_files():
    """
    Background task to clean up expired files
    """
    expired_files = FileShare.objects.filter(
        expires_at__lt=timezone.now()
    )
    
    deleted_count = 0
    for file_obj in expired_files:
        # Delete physical file
        file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                deleted_count += 1
            except OSError:
                pass  # File might already be deleted
        
        # Delete database record
        file_obj.delete()
    
    return f"Cleaned up {deleted_count} expired files"


@shared_task
def schedule_file_deletion(file_id):
    """
    Schedule a file for deletion after download
    """
    try:
        file_obj = FileShare.objects.get(id=file_id)
        if file_obj.is_expired():
            # Delete physical file
            file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass
            
            # Delete database record
            file_obj.delete()
            return f"File {file_obj.code} deleted successfully"
    except FileShare.DoesNotExist:
        return "File not found"
    
    return "File not yet expired"


@shared_task
def cleanup_orphaned_files():
    """
    Clean up files that exist on disk but not in database
    """
    if not os.path.exists(settings.MEDIA_ROOT):
        return "Media directory does not exist"
    
    # Get all file paths from database
    db_files = set(FileShare.objects.values_list('file_path', flat=True))
    
    # Get all files from media directory
    deleted_count = 0
    for root, dirs, files in os.walk(settings.MEDIA_ROOT):
        for file in files:
            file_path = os.path.relpath(os.path.join(root, file), settings.MEDIA_ROOT)
            if file_path not in db_files:
                try:
                    os.remove(os.path.join(root, file))
                    deleted_count += 1
                except OSError:
                    pass
    
    return f"Cleaned up {deleted_count} orphaned files"