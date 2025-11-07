from behave import given, when, then
from hamcrest import assert_that, contains_string, ends_with

@given('I am on the "Signup" page')
def step_impl(context):
    context.signup_page.open_page()

@when('I fill in the registration form with the following details:')
def step_impl(context):
    for row in context.table:
        full_name_parts = row['Full Name'].split(' ', 1)
        first_name = full_name_parts[0]
        last_name = full_name_parts[1] if len(full_name_parts) > 1 else ""

        context.signup_page.fill_first_name(first_name)
        context.signup_page.fill_last_name(last_name)
        context.signup_page.fill_email(row['Email'])
        context.signup_page.fill_username(row['Email']) # Using email as username for now
        context.signup_page.fill_password(row['Password'])
        context.signup_page.fill_password_confirm(row['Password'])

@when('I press the "Signup" button')
def step_impl(context):
    context.signup_page.click_signup()

@then('I should be redirected to the "Login" page')
def step_impl(context):
    assert_that(context.login_page.get_current_url(), ends_with(context.login_page.URL_PATH))

@then('I should see a success message "{message}"')
def step_impl(context, message):
    text = context.login_page.get_success_message()
    assert_that(text, contains_string(message))

@then('I should see a registration error message "{message}"') # <- Ubah ini!
def step_impl(context, message):
    # Dapatkan pesan error dari halaman registrasi
    error = context.signup_page.get_error_message()
    assert_that(error, equal_to(message))