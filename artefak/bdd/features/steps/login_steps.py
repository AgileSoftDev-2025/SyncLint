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
    assert_that(context.homepage_page.get_current_url(), ends_with(context.homepage_page.URL_PATH))

@then('I should see an error message "{message}"')
def step_impl(context, message):
    text = context.login_page.get_error_message()
    assert_that(text, contains_string(message))

@then('I should see an error message')
def step_impl(context):
    context.login_page.get_error_message()