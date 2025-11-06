from behave import given, when, then
from hamcrest import assert_that, contains_string, ends_with

@given('I am on the "Sign Up" page')
def step_impl(context):
    context.signup_page.open_page()

@when('I fill in "Email" with a valid email address "{email}"')
def step_impl(context, email):
    context.signup_page.fill_email(email)

@when('I fill in "Username" with a new username "{username}"')
def step_impl(context, username):
    context.signup_page.fill_username(username)

@when('I fill in "Password" with "{password}"')
def step_impl(context, password):
    context.signup_page.fill_password(password)

@when('I fill in "Confirm Password" with "{password}"')
def step_impl(context, password):
    context.signup_page.fill_confirm_password(password)

@when('I press the "Sign Up" button')
def step_impl(context):
    context.signup_page.click_signup()


@then('I should be redirected to the "Login" page')
def step_impl(context):
    assert_that(context.login_page.get_current_url(), ends_with(context.login_page.URL_PATH))

@then('I should see an error message related to "{error_text}"')
def step_impl(context, error_text):
    text = context.signup_page.get_error_message()
    assert_that(text, contains_string(error_text))

@then('I should remain on the "Sign Up" page')
def step_impl(context):
    assert_that(context.signup_page.get_current_url(), ends_with(context.signup_page.URL_PATH))