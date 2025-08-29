import os
import hashlib
from django.shortcuts import render
from django.http import Http404, FileResponse, JsonResponse
from django.conf import settings
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import FileShare
from .tasks import schedule_file_deletion
from datetime import timedelta


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """
    Upload a file and return a sharing code
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    # Check file size (50MB limit)
    if uploaded_file.size > 50 * 1024 * 1024:  # 50MB in bytes
        return Response(
            {'error': 'File size exceeds 50MB limit'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate unique filename while preserving extension
    import pathlib
    original_name = pathlib.Path(uploaded_file.name)
    file_extension = original_name.suffix  # Gets .pdf, .jpg, .txt, etc.
    file_stem = original_name.stem  # Gets filename without extension
    
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S_%f')  # More unique timestamp
    # Ensure we always have the original extension
    unique_filename = f"{timestamp}_{file_stem}{file_extension}"
    
    # Save file to media directory
    file_path = default_storage.save(
        f"uploads/{unique_filename}",
        ContentFile(uploaded_file.read())
    )
    
    # Create database record
    file_share = FileShare.objects.create(
        original_filename=uploaded_file.name,
        file_size=uploaded_file.size,
        content_type=uploaded_file.content_type or 'application/octet-stream',
        file_path=file_path,
    )
    
    return Response({
        'code': file_share.code,
        'filename': uploaded_file.name,
        'size': uploaded_file.size,
        'message': 'File uploaded successfully'
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_file_info(request, code):
    """
    Get file information by code
    """
    try:
        file_share = FileShare.objects.get(code=code)
    except FileShare.DoesNotExist:
        return Response(
            {'error': 'File not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not file_share.is_available():
        return Response(
            {'error': 'File no longer available'}, 
            status=status.HTTP_410_GONE
        )
    
    # Generate download token
    download_token = hashlib.sha256(
        f"{file_share.code}{timezone.now().isoformat()}".encode()
    ).hexdigest()
    
    file_share.download_token = download_token
    file_share.save()
    
    return Response({
        'filename': file_share.original_filename,
        'size': file_share.file_size,
        'content_type': file_share.content_type,
        'download_token': download_token,
        'created_at': file_share.created_at,
    })


@api_view(['GET', 'HEAD'])
def download_file(request, code, token):
    """
    Download file using code and token
    """
    try:
        file_share = FileShare.objects.get(
            code=code, 
            download_token=token
        )
    except FileShare.DoesNotExist:
        return Response(
            {'error': 'Invalid download link'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not file_share.is_available():
        return Response(
            {'error': 'File no longer available'}, 
            status=status.HTTP_410_GONE
        )
    
    # Check if file exists on disk
    file_path = os.path.join(settings.MEDIA_ROOT, file_share.file_path)
    
    if not os.path.exists(file_path):
        return Response(
            {'error': 'File not found on server'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Handle HEAD requests (for testing download availability)
    if request.method == 'HEAD':
        response = Response(status=status.HTTP_200_OK)
        response['Content-Type'] = file_share.content_type or 'application/octet-stream'
        response['Content-Length'] = str(file_share.file_size)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    # Mark as downloaded and schedule deletion
    file_share.mark_downloaded()
    
    # Trigger immediate cleanup of expired files (non-blocking)
    from django.core.management import call_command
    import threading
    
    def cleanup_background():
        try:
            # Clean up expired files in background
            call_command('cleanup_files', verbosity=0)
        except Exception:
            pass  # Silently handle errors
    
    # Start cleanup in background thread
    threading.Thread(target=cleanup_background, daemon=True).start()
    
    try:
        # Detect MIME type from file extension if not available
        import mimetypes
        detected_content_type = file_share.content_type
        if not detected_content_type or detected_content_type == 'application/octet-stream':
            detected_content_type, _ = mimetypes.guess_type(file_share.original_filename)
            detected_content_type = detected_content_type or 'application/octet-stream'
        
        # Return file response with proper filename handling
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=file_share.original_filename,
            content_type=detected_content_type
        )
        
        # Add CORS headers manually
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Type'
        
        # Ensure proper Content-Disposition header with filename and extension
        import urllib.parse
        safe_filename = urllib.parse.quote(file_share.original_filename)
        response['Content-Disposition'] = f'attachment; filename="{file_share.original_filename}"; filename*=UTF-8\'\'\'{safe_filename}'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Error serving file: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'version': '1.0.0'
    })
