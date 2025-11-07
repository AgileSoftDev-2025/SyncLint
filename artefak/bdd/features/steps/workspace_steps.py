# File: workspace_steps.py
from behave import given, when, then
from hamcrest import assert_that, equal_to, contains_string, not_

# --- GIVEN Steps ---
# Step "Given the User is logged in..." sudah di-handle oleh Background di .feature

@given('I am on the homepage')
def step_impl(context):
    # 'Background' sudah login, kita hanya perlu memastikan ada di homepage
    # Jika login tidak otomatis redirect, tambahkan navigasi di sini
    # context.homepage_page.open_page()
    pass # Asumsi login sudah redirect ke homepage

@given('a Workspace named "{name}" already exists in the system')
def step_impl(context, name):
    # Gunakan helper dari Page Object untuk memastikan data ada
    context.homepage_page.create_workspace_if_not_exists(name)

@given('the User is logged in and viewing a Workspace named "{name}"')
def step_impl(context, name):
    # Asumsi: "viewing" berarti sudah klik workspace itu dan pindah halaman
    # 1. Pastikan ada
    context.homepage_page.create_workspace_if_not_exists(name)
    # 2. Klik untuk membukanya (Implementasikan method 'click_workspace' jika perlu)
    # context.homepage_page.click_workspace(name)
    context.workspace_name = name # Simpan nama untuk verifikasi

@given('the User owns two Workspaces, namely "{name1}" and "{name2}"')
def step_impl(context, name1, name2):
    context.homepage_page.create_workspace_if_not_exists(name1)
    context.homepage_page.create_workspace_if_not_exists(name2)
    context.workspace_name = name2 # Target untuk di-rename/edit

@given('the User owns a Workspace named "{name}" which contains artifacts')
def step_impl(context, name):
    context.homepage_page.create_workspace_if_not_exists(name)
    context.workspace_name = name # Target untuk dihapus


# --- WHEN Steps (User Actions) ---

@when('the User clicks the "Create Workspace" button, fills the form with the Name "{name}"')
def step_impl(context, name):
    context.homepage_page.click_create_workspace()
    context.homepage_page.fill_workspace_name(name)

@when('the User clicks the "Create" button')
def step_impl(context):
    context.homepage_page.click_create_confirm()

@when('the User attempts to create a new Workspace named "{name}"')
def step_impl(context, name):
    # Gabungan dari dua step di atas
    context.homepage_page.click_create_workspace()
    context.homepage_page.fill_workspace_name(name)
    context.homepage_page.click_create_confirm()

@when('the User selects the 3-dots menu for "{name}", clicks the "rename" option')
def step_impl(context, name):
    context.workspace_name = name # Simpan nama lama
    context.homepage_page.click_workspace_menu(name)
    context.homepage_page.click_rename_option()

@when('the User enters the new name "{new_name}"')
def step_impl(context, new_name):
    context.new_workspace_name = new_name # Simpan nama baru
    context.homepage_page.fill_workspace_name(new_name) # Asumsi locator input sama

@when('the User clicks the "Rename" button')
def step_impl(context):
    context.homepage_page.click_rename_confirm()

@when('the User selects the "Edit Name" option for "{name}"')
def step_impl(context, name):
    # Step ini sama dengan "selects 3-dots menu... clicks rename"
    context.workspace_name = name
    context.homepage_page.click_workspace_menu(name)
    context.homepage_page.click_rename_option()

@when('the User attempts to change its name to "{new_name}"')
def step_impl(context, new_name):
    # Gabungan dari "enter new name" dan "click rename"
    context.new_workspace_name = new_name
    context.homepage_page.fill_workspace_name(new_name)
    context.homepage_page.click_rename_confirm()

@when('the User clicks the "Ganti Nama" button')
def step_impl(context):
    context.homepage_page.click_rename_confirm()

@when('the User clicks the "Hapus" button')
def step_impl(context):
    context.homepage_page.click_delete_confirm()

@when('the User selects the "Delete Workspace" option for "{name}"')
def step_impl(context, name):
    context.workspace_name = name
    context.homepage_page.click_workspace_menu(name)
    context.homepage_page.click_delete_option()

@when('the User confirms the deletion in the subsequent dialog')
def step_impl(context):
    context.homepage_page.click_delete_confirm()


# --- THEN Steps (Verification) ---

@then('the workspace creation form/modal is closed')
def step_impl(context):
    assert_that(
        context.homepage_page.is_create_modal_closed(), 
        equal_to(True),
        "Modal create workspace tidak tertutup"
    )

@then('a new Workspace named "{name}" is displayed in the Workspace list')
def step_impl(context, name):
    assert_that(
        context.homepage_page.is_workspace_visible(name),
        equal_to(True),
        f"Workspace '{name}' tidak ditemukan di list"
    )

@then('the system displays the error message "{error_message}"')
def step_impl(context, error_message):
    text = context.homepage_page.get_form_error_message()
    assert_that(text, contains_string(error_message))

@then('the Workspace name displayed on the screen changes to "{new_name}"')
def step_impl(context, new_name):
    # Asumsi ini mengecek judul di halaman detail
    # Jika masih di list, gunakan step "is reflected"
    
    # Verifikasi nama baru ada
    assert_that(
        context.homepage_page.is_workspace_visible(new_name),
        equal_to(True),
        f"Nama baru '{new_name}' tidak ditemukan"
    )
    # Verifikasi nama lama hilang
    assert_that(
        context.homepage_page.is_workspace_visible(context.workspace_name), # 'workspace_name' dari step 'When'
        equal_to(False),
        f"Nama lama '{context.workspace_name}' masih ada"
    )

@then('the name "{new_name}" is reflected in the main Workspace list')
def step_impl(context, new_name):
    assert_that(
        context.homepage_page.is_workspace_visible(new_name),
        equal_to(True),
        f"Nama baru '{new_name}' tidak ditemukan di list utama"
    )

@then('the system redirects the User to the main Workspace list/dashboard')
def step_impl(context):
    # Cek URL
    current_url = context.homepage_page.get_current_url()
    base_url = context.base_url + context.homepage_page.URL_PATH
    assert_that(current_url, equal_to(base_url), "User tidak di-redirect ke homepage")

@then('"{name}" is no longer visible in the Workspaces list')
def step_impl(context, name):
    assert_that(
        context.homepage_page.is_workspace_not_visible(name),
        equal_to(True),
        f"Workspace '{name}' masih terlihat di list"
    )