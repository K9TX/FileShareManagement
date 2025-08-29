from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_file, name='upload_file'),
    path('file/<str:code>/', views.get_file_info, name='get_file_info'),
    path('download/<str:code>/<str:token>/', views.download_file, name='download_file'),
    path('health/', views.health_check, name='health_check'),
]