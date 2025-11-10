# GANTI SEMUA ISI file api/views.py DENGAN INI:

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from .forms import CustomSignupForm, CustomLoginForm, WorkspaceForm
from .models import User, Workspace, Artefak
from django.core.serializers import serialize
import json

# =======================================================
# FUNGSI SIGNUP (SUDAH DIPERBAIKI)
# =======================================================
def signup_view(request):
    if request.method == 'POST':
        form = CustomSignupForm(request.POST) 
        if form.is_valid():
            user = form.save()
            
            # === PERBAIKAN BUG ===
            # Kita beri tahu Django backend mana yang harus digunakan
            user.backend = 'django.contrib.auth.backends.ModelBackend' 
            # =====================
            
            login(request, user)
            messages.success(request, 'Registrasi berhasil!')
            return redirect('homepage') 

    else:
        form = CustomSignupForm() 

    return render(request, 'signup.html', {'form': form})


# =======================================================
# FUNGSI LOGIN (SUDAH DIPERBAIKI)
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
                    
                    # === PERBAIKAN BUG ===
                    # Kita beri tahu Django backend mana yang harus digunakan
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    # =====================

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
# FUNGSI LOGOUT (BARU)
# =======================================================
def logout_view(request):
    logout(request)
    messages.success(request, 'Anda telah berhasil logout.')
    return redirect('login') # Redirect ke halaman login


# =======================================================
# FUNGSI HOMEPAGE 
# =======================================================
@login_required
def homepage_view(request):
    workspaces = Workspace.objects.filter(user=request.user)
    return render(request, 'homepage.html', {'workspaces': workspaces})

# =======================================================
# FUNGSI UNTUK MENAMPILKAN HALAMAN PROFIL (BARU)
# =======================================================
@login_required
def profile_page_view(request):
    # View ini hanya bertugas merender template HTML.
    # JavaScript di 'profile.js' yang akan mengambil datanya.
    return render(request, 'profile.html')

# =======================================================
# FUNGSI UNTUK MENAMPILKAN HALAMAN WORKSPACE (BARU)
# =======================================================
@login_required
def workspace_page_view(request, id):
    workspace = get_object_or_404(Workspace, id=id, user=request.user)
    # Anda bisa tambahkan logika untuk mengambil artefak di sini
    return render(request, 'workspace.html', {'workspace': workspace})

# =======================================================
# FUNGSI WORKSPACE API
# =======================================================
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
                    'id': workspace.id,
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

@login_required
@require_http_methods(['PUT', 'PATCH'])
def workspace_update(request, id):
    import json
    try:
        workspace = get_object_or_404(Workspace, id=id, user=request.user)
        data = json.loads(request.body)
        form = WorkspaceForm(data, instance=workspace)
        if form.is_valid():
            workspace = form.save()
            return JsonResponse({
                'status': 'success',
                'workspace': {
                    'id': workspace.id,
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

@login_required
@require_http_methods(['DELETE'])
def workspace_delete(request, id):
    workspace = get_object_or_404(Workspace, id=id, user=request.user)
    workspace.delete()
    return JsonResponse({'status': 'success'})

# =======================================================
# FUNGSI UNGGAL ARTEFAK (BARU)
# =======================================================
from .models import Artefak # Pastikan Artefak di-import di bagian atas
from engine.parsers import parse_artifact_file # Import parser engine kita

@login_required
@require_http_methods(['POST'])
def artefak_upload_view(request):
    """
    Menangani unggahan file artefak baru.
    View ini mengharapkan 'multipart/form-data', BUKAN JSON.
    Frontend harus mengirim 'file', 'name', 'type', dan 'workspace_id'.
    """
    try:
        # 1. Ambil data dari form-data (bukan json.loads)
        file_obj = request.FILES.get('file')
        name = request.POST.get('name')
        artefak_type = request.POST.get('type')
        workspace_id = request.POST.get('workspace_id')

        # 2. Validasi input
        if not all([file_obj, name, artefak_type, workspace_id]):
            return JsonResponse(
                {"status": "error", "errors": "Data tidak lengkap (file, name, type, workspace_id dibutuhkan)."},
                status=400
            )

        # 3. Validasi tipe artefak
        SUPPORTED_TYPES = [
            'USE_CASE_SPEC', 'BPMN', 'CLASS_DIAGRAM', 'USE_CASE_DIAGRAM',
            'ACTIVITY_DIAGRAM', 'SEQUENCE_DIAGRAM', 'WIREFRAME_SALT', 'SQL_DDL'
        ]
        if artefak_type not in SUPPORTED_TYPES:
            return JsonResponse(
                {"status": "error", "errors": f"Tipe artefak '{artefak_type}' tidak didukung."}, 
                status=400
            )

        # 4. Dapatkan workspace
        workspace = get_object_or_404(Workspace, id=workspace_id, user=request.user)

        # 5. Buat objek Artefak
        artefak = Artefak.objects.create(
            name=name,
            type=artefak_type,
            file=file_obj,
            workspace=workspace
            # filejson masih null
        )

        # 6. Panggil Engine Parser
        # Fungsi ini akan mem-parsing file dan mengisi field 'filejson'
        success, message = parse_artifact_file(artefak)

        if not success:
            artefak.delete() # Hapus file jika parsing gagal
            return JsonResponse(
                {"status": "error", "errors": f"Parsing gagal: {message}"}, 
                status=400
            )

        # 7. Kirim respons sukses
        return JsonResponse({
            "status": "success",
            "artefak": {
                "id": artefak.id,
                "name": artefak.name,
                "type": artefak.type,
                "file_url": artefak.file.url,
                "filejson_content": artefak.filejson # Mengirim kembali JSON yang sudah diparsing
            }
        }, status=201)

    except Workspace.DoesNotExist:
        return JsonResponse({"status": "error", "errors": "Workspace tidak ditemukan."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "errors": str(e)}, status=500)
    
# =======================================================
# FUNGSI API UNTUK MENGAMBIL DAFTAR ARTEFAK (BARU)
# =======================================================
@login_required
@require_http_methods(['GET'])
def get_artefaks_view(request, workspace_id):
    """
    Mengambil semua artefak yang terkait dengan workspace tertentu.
    """
    try:
        # 1. Pastikan workspace ini milik user yang sedang login
        workspace = get_object_or_404(Workspace, id=workspace_id, user=request.user)
        
        # --- TAMBAHKAN BARIS INI ---
        artefaks_query = Artefak.objects.filter(workspace=workspace)
        # --- SELESAI ---
        
        # 2. Ambil semua artefak yang terhubung ke workspace itu
        artefaks_list = []
        for artefak in artefaks_query: # <-- Sekarang ini akan berhasil
            artefaks_list.append({
                'id': artefak.id,
                'name': artefak.name,
                'type': artefak.type,
                'file_url': artefak.file.url  # <-- INI TAMBAHAN PENTING
            })
        
        # 3. Kirim sebagai JSON
        return JsonResponse({
            'status': 'success',
            'artefaks': artefaks_list # Kirim list yang baru
        })

    except Workspace.DoesNotExist:
        return JsonResponse({"status": "error", "errors": "Workspace tidak ditemukan."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "errors": str(e)}, status=500)
# =======================================================
# FUNGSI API UNTUK MENGUBAH NAMA (RENAME) ARTEFAK
# =======================================================
@login_required
@require_http_methods(['PATCH']) # PATCH digunakan untuk update sebagian
def artefak_update_view(request, artefak_id):
    """
    Mengubah nama (rename) artefak yang ada.
    """
    try:
        # 1. Ambil data JSON dari body request
        data = json.loads(request.body)
        new_name = data.get('name')

        if not new_name:
            return JsonResponse({"status": "error", "errors": "Nama baru tidak boleh kosong."}, status=400)

        # 2. Ambil artefak, pastikan pemiliknya adalah user yang login
        artefak = get_object_or_404(Artefak, id=artefak_id, workspace__user=request.user)
        
        # 3. Ubah nama dan simpan
        artefak.name = new_name
        artefak.save()
        
        return JsonResponse({
            'status': 'success',
            'artefak': {
                'id': artefak.id,
                'name': artefak.name
            }
        })

    except Exception as e:
        return JsonResponse({"status": "error", "errors": str(e)}, status=500)

# =======================================================
# FUNGSI API UNTUK MENGHAPUS (DELETE) ARTEFAK
# =======================================================
@login_required
@require_http_methods(['DELETE'])
def artefak_delete_view(request, artefak_id):
    """
    Menghapus artefak yang ada.
    """
    try:
        # 1. Ambil artefak, pastikan pemiliknya adalah user yang login
        artefak = get_object_or_404(Artefak, id=artefak_id, workspace__user=request.user)
        
        # 2. Hapus file fisiknya (opsional tapi bagus)
        if artefak.file:
            artefak.file.delete()
        if artefak.filejson:
            # (Jika filejson adalah FileField, Anda juga bisa menghapusnya)
            pass
            
        # 3. Hapus objek dari database
        artefak.delete()
        
        return JsonResponse({'status': 'success', 'message': 'Artefak berhasil dihapus.'})

    except Exception as e:
        return JsonResponse({"status": "error", "errors": str(e)}, status=500)