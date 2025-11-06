Feature: User Registration
  Sebagai pengguna baru, saya ingin mendaftar akun
  Agar saya bisa menggunakan layanan SyncLint.

  Scenario: Successful registration
    Given I am on the "Sign Up" page
    When I fill in "Email" with a valid email address "new_user1@example.com"
    And I fill in "Username" with a new username "new_user_1234"
    And I fill in "Password" with "StrongPassword123!"
    And I fill in "Confirm Password" with "StrongPassword123!"
    And I press the "Sign Up" button
    Then I should be redirected to the "Login" page

  Scenario: Password mismatch
    Given I am on the "Sign Up" page
    When I fill in "Email" with a valid email address "another_user@example.com"
    And I fill in "Username" with a new username "another_user"
    And I fill in "Password" with "StrongPassword123!"
    And I fill in "Confirm Password" with "MismatchedPassword!"
    And I press the "Sign Up" button
    Then I should see an error message related to "password"
    And I should remain on the "Sign Up" page