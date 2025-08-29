import os
import time
import threading
from django.utils import timezone
from django.conf import settings
from django.core.cache import cache
from fileservice.models import FileShare


class FileCleanupMiddleware:
    """
    Middleware that performs automatic cleanup of expired files.
    Uses caching to prevent excessive cleanup operations.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.cleanup_lock = threading.Lock()
        
    def __call__(self, request):
        # Perform cleanup check (with rate limiting)
        self._maybe_cleanup()
        
        response = self.get_response(request)
        return response
    
    def _maybe_cleanup(self):
        """
        Check if cleanup should be performed.
        Only runs cleanup every 5 minutes to avoid performance issues.
        """
        cache_key = 'file_cleanup_last_run'
        last_cleanup = cache.get(cache_key, 0)
        current_time = time.time()
        
        # Run cleanup every 5 minutes (300 seconds)
        if current_time - last_cleanup > 300:
            # Use lock to prevent multiple simultaneous cleanups
            if self.cleanup_lock.acquire(blocking=False):
                try:
                    self._perform_cleanup()
                    cache.set(cache_key, current_time, timeout=600)  # Cache for 10 minutes
                finally:
                    self.cleanup_lock.release()
    
    def _perform_cleanup(self):
        """
        Perform the actual cleanup of expired files.
        This runs in the background to avoid blocking requests.
        """
        try:
            # Find expired files
            expired_files = FileShare.objects.filter(
                expires_at__lt=timezone.now()
            )
            
            deleted_count = 0
            for file_obj in expired_files:
                try:
                    # Delete physical file
                    file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    
                    # Delete database record
                    file_obj.delete()
                    deleted_count += 1
                    
                except Exception:
                    # Silently handle errors to avoid breaking the application
                    continue
            
            # Optional: Clean up a few orphaned files (limit to prevent performance issues)
            self._cleanup_orphaned_files_limited()
            
        except Exception:
            # Silently handle any errors to avoid breaking the application
            pass
    
    def _cleanup_orphaned_files_limited(self):
        """
        Clean up a limited number of orphaned files to prevent performance issues.
        """
        try:
            uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            if not os.path.exists(uploads_dir):
                return
            
            # Get all file paths from database
            db_files = set(FileShare.objects.values_list('file_path', flat=True))
            
            # Clean up max 10 orphaned files per cleanup cycle
            cleaned_count = 0
            max_cleanup = 10
            
            for root, dirs, files in os.walk(uploads_dir):
                if cleaned_count >= max_cleanup:
                    break
                    
                for file in files:
                    if cleaned_count >= max_cleanup:
                        break
                        
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(full_path, settings.MEDIA_ROOT)
                    
                    if relative_path not in db_files:
                        try:
                            os.remove(full_path)
                            cleaned_count += 1
                        except OSError:
                            continue
                            
        except Exception:
            # Silently handle errors
            pass