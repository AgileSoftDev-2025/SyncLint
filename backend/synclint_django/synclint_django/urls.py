"""
URL configuration for synclint_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings               # <-- TAMBAHKAN INI
from django.conf.urls.static import static     # <-- TAMBAHKAN INI

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), 
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  
    path('api/profile/', include('profiles.urls')),
]

# TAMBAHKAN BLOK INI DI BAGIAN PALING BAWAH:
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)