from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # Buat profile baru kalau user baru
        Profile.objects.create(user=instance)
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        # Kalau profile belum ada, buat baru
        Profile.objects.create(user=instance)