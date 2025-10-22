"""
Views for SecApp core functionality
"""
import logging
from django.http import JsonResponse
from django.conf import settings
from django.db import connection
from django.core.cache import cache

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Health check endpoint pour vérifier l'état de l'application.

    Vérifie:
    - L'état de l'application Django
    - La connexion à la base de données PostgreSQL
    - La configuration de base

    Returns:
        JsonResponse: Status de santé de l'application
    """
    status = {
        'status': 'healthy',
        'service': 'SecApp Backend',
        'version': '1.0.0',
        'checks': {}
    }

    http_status = 200

    # Check 1: Database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        status['checks']['database'] = {
            'status': 'healthy',
            'message': 'Database connection successful'
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        status['checks']['database'] = {
            'status': 'unhealthy',
            'message': f'Database connection failed: {str(e)}'
        }
        status['status'] = 'unhealthy'
        http_status = 503

    # Check 2: Settings configuration
    try:
        critical_settings = [
            'SECRET_KEY',
            'DATABASES',
            'INSTALLED_APPS',
        ]

        config_ok = all(hasattr(settings, setting) for setting in critical_settings)

        if config_ok:
            status['checks']['configuration'] = {
                'status': 'healthy',
                'message': 'All critical settings configured'
            }
        else:
            status['checks']['configuration'] = {
                'status': 'unhealthy',
                'message': 'Missing critical settings'
            }
            status['status'] = 'unhealthy'
            http_status = 503
    except Exception as e:
        logger.error(f"Configuration health check failed: {str(e)}")
        status['checks']['configuration'] = {
            'status': 'unhealthy',
            'message': f'Configuration check failed: {str(e)}'
        }
        status['status'] = 'unhealthy'
        http_status = 503

    # Check 3: Debug mode status
    status['checks']['debug_mode'] = {
        'status': 'info',
        'enabled': settings.DEBUG
    }

    # Check 4: Apps status
    installed_apps_count = len(settings.INSTALLED_APPS)
    status['checks']['installed_apps'] = {
        'status': 'info',
        'count': installed_apps_count,
        'apps': [app for app in settings.INSTALLED_APPS if app.startswith('users') or app.startswith('questionnaires')]
    }

    return JsonResponse(status, status=http_status)
