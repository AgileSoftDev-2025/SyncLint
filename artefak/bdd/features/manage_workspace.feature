Feature: Managing a Workspace
  As a workspace owner, I want to rename or delete my workspace
  So that project information remains accurate and irrelevant workspaces can be cleaned up.

  Background: User is logged in
    # GANTI email/password dengan akun tes yang valid
    Given I am on the "Login" page
    When I enter email "aan@gmail.com" and password "hebat123"
    And I press the "Login" button
    Then I should be redirected to the "homepage"

  Scenario: Successful Workspace Rename
    Given a Workspace named "Project BDD" already exists in the system
    When the User selects the 3-dots menu for "Project BDD", clicks the "rename" option
    And the User enters the new name "Rename BDD"
    And the User clicks the "Ganti Nama" button
    Then the Workspace name displayed on the screen changes to "Rename BDD"
    And the name "Rename BDD" is reflected in the main Workspace list

  Scenario: Successful Workspace Deletion
    Given the User owns a Workspace named "Rename BDD" which contains artifacts
    When the User selects the "Delete Workspace" option for "Rename BDD"
    And the User clicks the "Hapus" button
    Then the system redirects the User to the main Workspace list/dashboard
    And "Rename BDD" is no longer visible in the Workspaces list

  