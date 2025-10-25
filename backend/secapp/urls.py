from django.contrib import admin
from django.urls import path
from django.http import HttpResponse

def hello(request):
    return HttpResponse("Oe ça marche la famille")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('hello/', hello),
]
