from behave import given, when, then
from hamcrest import assert_that, contains_string, ends_with, equal_to

@given('I am on the "Login" page')
def step_impl(context):
    context.login_page.open_page()

@when('I enter email "{email}" and password "{password}"')
def step_impl(context, email, password):
    context.login_page.fill_email(email)
    context.login_page.fill_password(password)

@when('I press the "Login" button')
def step_impl(context):
    context.login_page.click_login()

@then('I should be redirected to the "homepage"')
def step_impl(context):
    # Check for login error message first
    error_message = context.login_page.get_error_message()
    if error_message:
        assert_that(False, f"Login failed with error: {error_message}")
    
    # If no error, then assert redirection
    assert_that(context.homepage_page.get_current_url(), ends_with(context.homepage_page.URL_PATH))

@then('I should see a login error message "{message}"') # <- Ubah ini!
def step_impl(context, message):
    error = context.login_page.get_error_message()
    assert_that(error, equal_to(message))

@then('I should see an error message')
def step_impl(context):
    context.login_page.get_error_message()