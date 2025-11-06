Feature: User Login
  Sebagai pengguna terdaftar, saya ingin login
  Agar saya bisa mengakses dashboard saya.

  Scenario: Successful login
    Given I am on the "Login" page
    # Akun "UserSynclint@gmail.com" dengan password "123lkjas" sudah ada
    When I enter email "UserSynclint@gmail.com" and password "123lkjas"
    And I press the "Login" button
    Then I should be redirected to the "homepage"


  Scenario: Invalid credentials
    Given I am on the "Login" page
    When I enter email "registered@example.com" and password "WrongPassword"
    And I press the "Login" button
    Then I should see an error message 
