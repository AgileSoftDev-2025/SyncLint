from behave import *
from django.contrib.auth import get_user_model
from api.models import Workspace, Artefak
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
import json

@given('saya adalah pengguna yang sudah login dengan email "{email}"')
def step_impl(context, email):
    User = get_user_model()
    context.client = APIClient()  # ✅ FIX
  
    context.user = User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password="password123"
    )

    context.client.force_authenticate(user=context.user)  # ✅ FIX
