from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User
import uuid  

class CustomSignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'password1', 'password2')  

    def save(self, commit=True):
        user = super().save(commit=False)
        user.user_id = str(uuid.uuid4())[:10]  
        user.set_password(self.cleaned_data['password1'])  
        user.kota = ''  
        user.negara = ''
        user.no_telp = ''
        user.photo = ''
        if commit:
            user.save()
        return user

class CustomLoginForm(forms.Form):
    username = forms.EmailField(label='Email', max_length=100)
    password = forms.CharField(label='Password', widget=forms.PasswordInput)