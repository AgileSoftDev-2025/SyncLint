from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User, Workspace
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
        workspace.workspace_id = str(uuid.uuid4())[:5]
        if user:
            workspace.user = user
        if commit:
            workspace.save()
        return workspace