from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def hello(request):
    return HttpResponse("SecApp Backend is running!")

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('users.urls', namespace='users')),

    # Test endpoint
    path('', hello),
]
