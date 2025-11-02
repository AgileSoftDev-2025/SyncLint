Feature: Creating a New Workspace
  As a logged-in user, I want to create a new workspace
  So that I can manage my project artifacts separately and in an organized manner.

  Scenario: Successful Workspace Creation
    Given the User is logged in to the SyncLint application and viewing the Workspace list
    When the User clicks the "Create Workspace" button, fills the form with the Name "Project Alpha"
      And the User clicks the "Create" button
    Then the workspace creation form/modal is closed
      And a new Workspace named "Project Alpha" is displayed in the Workspace list

  Scenario: Failure Due to Duplicate Workspace Name
    Given the User is logged in
      And a Workspace named "Project Beta" already exists in the system
    When the User attempts to create a new Workspace named "Project Beta"
    Then the system displays the error message "Workspace name already in use, please choose another name"