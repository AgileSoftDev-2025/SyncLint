# File: backend/synclint_django/profiles/signals.py (VERSI FINAL)

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings # <-- Ganti import
from .models import Profile

# Ganti 'sender=User' menjadi 'sender=settings.AUTH_USER_MODEL'
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # Buat profile baru kalau user baru
        Profile.objects.create(user=instance)
    try:
        # Selalu simpan profile terkait setiap kali user disimpan
        instance.profile.save()
    except Profile.DoesNotExist:
        # Kalau profile belum ada (kasus data lama), buat baru
        Profile.objects.create(user=instance)