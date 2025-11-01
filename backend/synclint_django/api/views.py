<<<<<<< HEAD
from django.shortcuts import render

# Create your views here.
=======
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login 
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .forms import CustomSignupForm, CustomLoginForm, WorkspaceForm
from .models import User, Workspace


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
            return redirect('homepage')

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
@login_required
def homepage_view(request):
    workspaces = Workspace.objects.filter(user=request.user)
    return render(request, 'homepage.html', {'workspaces': workspaces})

# =======================================================
# FUNGSI WORKSPACE API
# =======================================================
@csrf_exempt
@login_required
@require_http_methods(['POST'])
def workspace_create(request):
    import json
    try:
        data = json.loads(request.body)
        form = WorkspaceForm(data)
        if form.is_valid():
            workspace = form.save(user=request.user)
            return JsonResponse({
                'status': 'success',
                'workspace': {
                    'id': workspace.workspace_id,
                    'name': workspace.name,
                    'description': workspace.description,
                    'created_at': workspace.created_at.strftime('%d %B %Y'),
                    'updated_at': workspace.updated_at.strftime('%d %B %Y')
                }
            })
        return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'errors': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'errors': str(e)}, status=400)

@csrf_exempt
@login_required
@require_http_methods(['PUT', 'PATCH'])
def workspace_update(request, workspace_id):
    import json
    try:
        workspace = get_object_or_404(Workspace, workspace_id=workspace_id, user=request.user)
        data = json.loads(request.body)
        form = WorkspaceForm(data, instance=workspace)
        if form.is_valid():
            workspace = form.save()
            return JsonResponse({
                'status': 'success',
                'workspace': {
                    'id': workspace.workspace_id,
                    'name': workspace.name,
                    'description': workspace.description,
                    'updated_at': workspace.updated_at.strftime('%d %B %Y')
                }
            })
        return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'errors': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'errors': str(e)}, status=400)

@csrf_exempt
@login_required
@require_http_methods(['DELETE'])
def workspace_delete(request, workspace_id):
    workspace = get_object_or_404(Workspace, workspace_id=workspace_id, user=request.user)
    workspace.delete()
    return JsonResponse({'status': 'success'})
>>>>>>> 68f5b749265bf3598a1736b3b6e669c208ca660b
