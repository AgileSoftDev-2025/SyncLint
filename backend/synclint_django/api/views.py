from django.shortcuts import render, redirect
from django.contrib.auth import login 
from django.contrib import messages
from .forms import CustomSignupForm, CustomLoginForm
from .models import User


# =======================================================
# FUNGSI SIGNUP 
# =======================================================
def signup_view(request):
    if request.method == 'POST':
        form = CustomSignupForm(request.POST) 
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registrasi berhasil!')
            return redirect('login')

    else:

        form = CustomSignupForm() 

    return render(request, 'signup.html', {'form': form})


# =======================================================
# FUNGSI LOGIN 
# =======================================================
def login_view(request):
    if request.method == 'POST':

        form = CustomLoginForm(request.POST) 
        
        if form.is_valid():

            email_dari_form = form.cleaned_data['username'] 
            password_dari_form = form.cleaned_data['password']

            try:
                user = User.objects.get(email__iexact=email_dari_form)
                if user.check_password(password_dari_form):
                    login(request, user)
                    return redirect('homepage')
                else:
                    messages.error(request, 'Email atau password salah.')
            
            except User.DoesNotExist:
                messages.error(request, 'Email atau password salah.')

    
    else:

        form = CustomLoginForm() 

    return render(request, 'index.html', {'form': form})


# =======================================================
# FUNGSI HOMEPAGE 
# =======================================================
def homepage_view(request):
    return render(request, 'homepage.html')