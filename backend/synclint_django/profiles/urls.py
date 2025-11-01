from django.urls import path
from .views import ProfileDetail

urlpatterns = [
    path('', ProfileDetail.as_view(), name='profile-detail'),
]