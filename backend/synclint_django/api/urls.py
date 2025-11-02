# File: backend/synclint_django/api/urls.py

from django.urls import path
from .views import (
    signup_view, login_view, homepage_view, logout_view, profile_page_view,
    workspace_page_view,
    workspace_create, workspace_update, workspace_delete,
    artefak_upload_view  # <-- TAMBAHKAN IMPORT INI
)
from django.views.generic import RedirectView

urlpatterns = [
    path('', login_view, name='api_index'),
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('homepage/', homepage_view, name='homepage'),
    path('logout/', logout_view, name='logout'),
    path('profile_page/', profile_page_view, name='profile_page'),
    
    # Halaman Workspace
    path('workspace/<int:id>/', workspace_page_view, name='workspace_page'),
    
    # Workspace API endpoints
    path('workspace/create/', workspace_create, name='workspace_create'),
    path('workspace/<int:id>/update/', workspace_update, name='workspace_update'),
    path('workspace/<int:id>/delete/', workspace_delete, name='workspace_delete'),

    # --- TAMBAHKAN BARIS INI ---
    # Artefak API endpoint
    path('artefak/upload/', artefak_upload_view, name='artefak_upload'),
]