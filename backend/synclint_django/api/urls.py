from django.urls import path
from .views import signup_view, login_view, homepage_view
from .views import workspace_create, workspace_update, workspace_delete
from django.views.generic import RedirectView

urlpatterns = [
    path('', login_view, name='api_index'),
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('homepage/', homepage_view, name='homepage'),
    # Workspace API endpoints
    path('workspace/create/', workspace_create, name='workspace_create'),
    path('workspace/<str:workspace_id>/update/', workspace_update, name='workspace_update'),
    path('workspace/<str:workspace_id>/delete/', workspace_delete, name='workspace_delete'),
]

