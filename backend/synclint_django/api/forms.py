# File: backend/synclint_django/api/forms.py (VERSI FINAL SEBENARNYA)

from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User, Workspace
import uuid  

class CustomSignupForm(UserCreationForm):
    # Kita tambahkan first_name dan last_name ke form pendaftaran
    first_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150, required=False)

    class Meta(UserCreationForm.Meta): # PENTING: Warisi dari Meta induk
        model = User
        # Tentukan field yang ingin kita tambahkan ke form UserCreationForm
        fields = ('username', 'email', 'first_name', 'last_name') 

    # Method save() ini sekarang mewarisi hashing password dari induknya
    # dan hanya menambahkan data first_name dan last_name.
    def save(self, commit=True):
        user = super().save(commit=False) # Jangan simpan dulu
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
        return user

class CustomLoginForm(forms.Form):
    # 'username' di sini sebenarnya adalah 'email'
    username = forms.EmailField(label='Email', max_length=100) 
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

class WorkspaceForm(forms.ModelForm):
    class Meta:
        model = Workspace
        fields = ['name', 'description']
        error_messages = {
            'name': {
                'required': 'Nama workspace harus diisi.',
                'max_length': 'Nama workspace tidak boleh lebih dari 50 karakter.'
            }
        }
    
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if name:
            name = name.strip()
            if len(name) < 1:
                raise forms.ValidationError('Nama workspace tidak boleh kosong.')
        return name
    
    def save(self, user=None, commit=True):
        workspace = super().save(commit=False)
        if user:
            workspace.user = user
        if commit:
            workspace.save()
        return workspace