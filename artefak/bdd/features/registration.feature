Feature: User Registration
  As a new user, I want to create an account
  So that I can log in and use the application.

  Scenario: Successful Registration
    Given I am on the "Signup" page
    When I fill in the registration form with the following details:
      | Full Name | Email                | Password   |
      | Test User | testuser@example.com | password123|
    And I press the "Signup" button
    Then I should be redirected to the "Login" page
    And I should see a success message "Registration successful. Please log in."

  Scenario: Registration with Existing Email
    Given I am on the "Signup" page
    When I fill in the registration form with the following details:
      | Full Name | Email                | Password   |
      | Test User | aan@gmail.com | password123|
    And I press the "Signup" button
    Then I should see an error message "Email already exists"
