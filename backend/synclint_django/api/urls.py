# GANTI SEMUA ISI file api/urls.py DENGAN INI:

from django.urls import path
from .views import (
    signup_view, login_view, homepage_view, logout_view, profile_page_view,
    workspace_page_view, # <-- Impor view baru
    workspace_create, workspace_update, workspace_delete
)
from django.views.generic import RedirectView

urlpatterns = [
    path('', login_view, name='api_index'),
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('homepage/', homepage_view, name='homepage'),
    path('logout/', logout_view, name='logout'),
    path('profile_page/', profile_page_view, name='profile_page'),
    # Workspace API endpoints
    path('workspace/<int:id>/', workspace_page_view, name='workspace_page'),
    
    # Workspace API endpoints (DIPERBAIKI)
    path('workspace/create/', workspace_create, name='workspace_create'),
    path('workspace/<int:id>/update/', workspace_update, name='workspace_update'),
    path('workspace/<int:id>/delete/', workspace_delete, name='workspace_delete'),
]