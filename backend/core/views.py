"""
Core views for health checks and monitoring
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Health check endpoint - returns basic service status
    Used by Docker and orchestrators to check if service is alive
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'SecApp Backend',
        'version': '1.0.0-phase0',
    })


def readiness_check(request):
    """
    Readiness check endpoint - verifies service is ready to handle requests
    Checks database connectivity and other critical dependencies
    """
    checks = {
        'database': False,
    }

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            checks['database'] = True
    except Exception as e:
        logger.error(f"Database check failed: {str(e)}")
        checks['database'] = False

    # Determine overall status
    all_ready = all(checks.values())
    status_code = 200 if all_ready else 503

    response_data = {
        'status': 'ready' if all_ready else 'not_ready',
        'service': 'SecApp Backend',
        'checks': checks,
    }

    return JsonResponse(response_data, status=status_code)