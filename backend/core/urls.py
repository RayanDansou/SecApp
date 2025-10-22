"""
Core URLs - Health checks and monitoring
"""
from django.urls import path
from . import views

urlpatterns = [
    path('healthz/', views.health_check, name='health_check'),
    path('readyz/', views.readiness_check, name='readiness_check'),
]