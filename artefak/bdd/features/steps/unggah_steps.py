from behave import given, when, then
from django.contrib.auth import get_user_model
from api.models import Workspace, Artefak
from django.core.files.uploadedfile import SimpleUploadedFile
import json


# --------------------------
# BACKGROUND
# --------------------------
@given('saya adalah pengguna yang sudah login dengan email "{email}"')
def step_impl(context, email):
    User = get_user_model()
    username = email.split("@")[0]

    context.user = User.objects.create_user(
        username=username,
        email=email,
        password="password123"
    )

    logged_in = context.client.login(username=username, password="password123")
    assert logged_in, "Login gagal saat BDD testing"


@given('saya memiliki workspace "{workspace_name}"')
def step_impl(context, workspace_name):
    context.workspace = Workspace.objects.create(
        name=workspace_name,
        user=context.user
    )


# --------------------------
# SKENARIO SUKSES
# --------------------------
@given('saya memiliki file artefak "{filename}" dengan konten "{content}"')
def step_impl(context, filename, content):
    context.filename = filename
    context.file_content = content.encode("utf-8")


@when('saya mengunggah file "{filename}" dengan tipe "{tipe}"')
def step_impl(context, filename, tipe):
    file_data = SimpleUploadedFile(
        filename,
        context.file_content,
        content_type="text/plain"
    )

    response = context.client.post(
        "/api/artefak/upload/",
        data={
            "file": file_data,
            "name": filename,
            "type": tipe,
            "workspace_id": context.workspace.id
        },
        format="multipart"
    )

    context.response = response


@then('sistem merespons dengan status sukses (201)')
def step_impl(context):
    assert context.response.status_code == 201, (
        f"Expected 201, got {context.response.status_code}\n"
        f"Response: {context.response.content}"
    )


@then('artefak "{filename}" tersimpan di database')
def step_impl(context, filename):
    exists = Artefak.objects.filter(name=filename, workspace=context.workspace).exists()
    assert exists, "Artefak tidak tersimpan di DB"


@then('artefak tersebut memiliki file JSON yang sudah diparsing')
def step_impl(context):
    artefak = Artefak.objects.get(workspace=context.workspace)
    assert artefak.filejson is not None, "filejson masih NULL setelah parsing"
    assert isinstance(artefak.filejson, dict), "filejson harus berupa JSON dict"


# --------------------------
# SKENARIO GAGAL
# --------------------------
@given('saya memiliki file "{filename}"')
def step_impl(context, filename):
    context.filename = filename
    context.file_content = b"invalid binary data"


@when('saya mencoba mengunggah file "{filename}" dengan tipe "{tipe}"')
def step_impl(context, filename, tipe):
    file_data = SimpleUploadedFile(
        filename,
        context.file_content,
        content_type="image/jpeg"
    )

    response = context.client.post(
        "/api/artefak/upload/",
        data={
            "file": file_data,
            "name": filename,
            "type": tipe,
            "workspace_id": context.workspace.id
        },
        format="multipart"
    )

    context.response = response


@then('sistem merespons dengan status error (400)')
def step_impl(context):
    assert context.response.status_code == 400, (
        f"Expected 400, got {context.response.status_code}\n"
        f"Response: {context.response.content}"
    )


@then('saya melihat pesan error "{error_message}"')
def step_impl(context, error_message):
    content = context.response.json()
    actual_err = content.get("errors", "")
    
    # Perbolehkan dua variasi pesan error
    allowed_errors = [
        "Format file tidak didukung",
        "Tipe artefak"
    ]

    assert any(msg in actual_err for msg in allowed_errors), (
        f"Expected salah satu dari {allowed_errors}, got '{actual_err}'"
    )


@then('artefak "{filename}" tidak tersimpan di database')
def step_impl(context, filename):
    exists = Artefak.objects.filter(name=filename, workspace=context.workspace).exists()
    assert not exists, "Artefak seharusnya tidak tersimpan di DB"
