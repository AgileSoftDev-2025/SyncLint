# File: backend/synclint_django/api/models.py (VERSI FINAL)

from django.db import models
from django.contrib.auth.models import AbstractUser

# 🧍 USER MODEL (Sekarang bersih, hanya untuk login)
class User(AbstractUser):
    # Kita tidak perlu field tambahan di sini
    # karena akan diurus oleh model Profile
    def __str__(self):
        return self.username

# 🧩 WORKSPACE MODEL (Tetap sama)
class Workspace(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workspaces')

    def __str__(self):
        return self.name

# 📄 ARTEFAK MODEL (Tetap sama)
class Artefak(models.Model):
    name = models.CharField(max_length=50)
    file = models.FileField(upload_to='artefak/')
    filejson = models.JSONField(blank=True, null=True)
    type = models.CharField(max_length=50)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='artefaks')

    def __str__(self):
        return self.name

# 📊 REPORT MODEL (Tetap sama)
class Report(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    result = models.TextField()
    artefaks = models.ManyToManyField(Artefak, related_name='reports')

    def __str__(self):
        return f"Report {self.id} (dibuat pada {self.date.strftime('%Y-%m-%d')})"