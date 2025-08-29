from django.db import models
from django.utils import timezone
import string
import random
from datetime import timedelta


def generate_file_code():
    """Generate a random 8-character alphanumeric code"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(8))


class FileShare(models.Model):
    # File metadata
    code = models.CharField(max_length=8, unique=True, default=generate_file_code)
    original_filename = models.CharField(max_length=255)
    file_size = models.BigIntegerField()  # Size in bytes
    content_type = models.CharField(max_length=100)
    
    # File storage path (relative to media root)
    file_path = models.CharField(max_length=500)
    
    # Download tracking
    is_downloaded = models.BooleanField(default=False)
    download_count = models.IntegerField(default=0)
    downloaded_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Security
    download_token = models.CharField(max_length=64, null=True, blank=True)
    
    class Meta:
        db_table = 'file_shares'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['created_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.original_filename}"
    
    def is_expired(self):
        """Check if the file has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def is_available(self):
        """Check if file is available for download"""
        return not self.is_downloaded and not self.is_expired()
    
    def mark_downloaded(self):
        """Mark file as downloaded and set expiration"""
        from django.conf import settings
        
        self.is_downloaded = True
        self.download_count += 1
        self.downloaded_at = timezone.now()
        # Set expiration to 1 minute after download
        self.expires_at = timezone.now() + timedelta(minutes=getattr(settings, 'FILE_EXPIRE_MINUTES', 1))
        self.save()
    
    def save(self, *args, **kwargs):
        # Ensure code is unique
        if not self.code:
            self.code = generate_file_code()
            while FileShare.objects.filter(code=self.code).exists():
                self.code = generate_file_code()
        super().save(*args, **kwargs)
