Feature: User Login
  As a registered user, I want to log in to my account
  So that I can access my dashboard and workspace.

  Scenario: Successful Login
    Given I am on the "Login" page
    When I enter email "aan@gmail.com" and password "hebat123"
    And I press the "Login" button
    Then I should be redirected to the "homepage"

  Scenario: Login with Invalid Credentials
    Given I am on the "Login" page
    When I enter email "invalid@example.com" and password "invalidpassword"
    And I press the "Login" button
    Then I should see an error message "Invalid credentials"
