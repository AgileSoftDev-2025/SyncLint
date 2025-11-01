# File: backend/synclint_django/profiles/serializers.py (SUDAH DIPERBAIKI)

from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # Mengambil data read-only dari model User yang terhubung
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    # Field password (hanya untuk tulis, tidak untuk dibaca)
    password = serializers.CharField(write_only=True, required=False, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=False, label='Konfirmasi password', style={'input_type': 'password'})
    
    class Meta:
        model = Profile
        # Pastikan field ini cocok dengan nama di profiles/models.py
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name',         # Ditambahkan
            'last_name',          # Ditambahkan
            'bio', 
            'no_telp',            # Diperbaiki dari 'phone_number'
            'location', 
            'photo',
            'cover_photo',
            'kota',               # Ditambahkan
            'negara',
            'password', 
            'password2'          # Ditambahkan
        ]

        # 'photo' adalah read-only karena di-handle oleh upload file terpisah
        read_only_fields = ['id', 'username', 'email', 'first_name', 'last_name', 'photo' ]
        
    def validate(self, data):
        """
        Validasi bahwa password dan konfirmasi password cocok.
        """
        password = data.get('password')
        password2 = data.pop('password2', None) # Ambil dan hapus password2

        if password or password2: # Jika salah satu diisi, keduanya wajib
            if not password:
                raise serializers.ValidationError("Password harus diisi jika konfirmasi password diisi.")
            if not password2:
                raise serializers.ValidationError("Konfirmasi password harus diisi jika password diisi.")
            if password != password2:
                raise serializers.ValidationError("Password dan konfirmasi password tidak cocok.")
        return data # 'data' sekarang hanya berisi 'password' (jika ada)

    def update(self, instance, validated_data):
        """
        Override method update untuk menghandle hashing password.
        """
        # Ambil password dari data, atau None jika tidak ada
        password = validated_data.pop('password', None)

        # Update field Profile (no_telp, kota, negara, dll)
        # 'instance' di sini adalah obyek Profile
        super().update(instance, validated_data)

        # JIKA ada password baru, update User model
        if password:
            user = instance.user
            user.set_password(password) # <-- Ini akan MENG-HASH password
            user.save()

        return instance
        
        
        
        
        