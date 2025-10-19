from django.db import models
from django.contrib.auth.models import AbstractUser


# 🧍 USER MODEL
class User(AbstractUser):
    user_id = models.CharField(max_length=10, primary_key=True)
    kota = models.CharField(max_length=100, blank=True, null=True)
    negara = models.CharField(max_length=100, blank=True, null=True)
    no_telp = models.CharField(max_length=20, blank=True, null=True)
    photo = models.CharField(max_length=100, blank=True, null=True)

    # Override field bawaan untuk konsistensi dengan PDM
    email = models.EmailField(max_length=100, unique=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.username} ({self.user_id})"


# 🧩 WORKSPACE MODEL
class Workspace(models.Model):
    workspace_id = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Relasi ke User
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workspaces')

    def __str__(self):
        return f"{self.name} ({self.workspace_id})"


# 📄 ARTEFAK MODEL
class Artefak(models.Model):
    artefak_id = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=50)
    file = models.FileField(upload_to='artefak/')
    filejson = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=50)

    # Relasi ke Workspace
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='artefaks')

    def __str__(self):
        return f"{self.name} ({self.artefak_id})"


# 📊 REPORT MODEL
class Report(models.Model):
    report_id = models.CharField(max_length=10, primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    result = models.TextField()

    # Relasi ke Artefak
    artefak = models.ForeignKey(Artefak, on_delete=models.CASCADE, related_name='reports')

    def __str__(self):
        return f"Report {self.report_id} ({self.artefak.name})"

