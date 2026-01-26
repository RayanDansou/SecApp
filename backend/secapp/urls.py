from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

def hello(request):
    return HttpResponse("SecApp Backend is running!")

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('users.urls', namespace='users')),
    path('api/', include('questionnaires.urls', namespace='questionnaires')),

    # Test endpoint
    path('', hello),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)