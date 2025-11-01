# File: backend/synclint_django/profiles/models.py (VERSI FINAL)

from django.conf import settings
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Field dari app 'profiles' yang lama
    bio = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='profile_images/', blank=True, null=True) # ganti nama dari profile_image
    
    # === TAMBAHKAN BARIS INI ===
    cover_photo = models.ImageField(upload_to='cover_images/', blank=True, null=True)
    # ==========================
    
    location = models.CharField(max_length=100, blank=True, null=True)

    # Field yang kita pindah dari 'api/models.py'
    kota = models.CharField(max_length=100, blank=True, null=True)
    negara = models.CharField(max_length=100, blank=True, null=True)
    no_telp = models.CharField(max_length=20, blank=True, null=True) # ganti nama dari phone_number

    def __str__(self):
        return self.user.username