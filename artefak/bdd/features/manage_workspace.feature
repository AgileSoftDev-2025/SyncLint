Feature: Managing a Workspace
  As a workspace owner, I want to rename or delete my workspace
  So that project information remains accurate and irrelevant workspaces can be cleaned up.

  Scenario: Successful Workspace Rename
    Given the User is logged in and viewing a Workspace named "Old Report"
    When the User selects the 3-dots menu, clicks the "rename" option
      And the User enters the new name "Final Report"
      And the User clicks the "Rename" button
    Then the Workspace name displayed on the screen changes to "Final Report"
      And the name "Final Report" is reflected in the main Workspace list

  Scenario: Successful Workspace Deletion
    Given the User is logged in
      And the User owns a Workspace named "Obsolete Project" which contains artifacts
    When the User selects the "Delete Workspace" option for "Obsolete Project"
      And the User confirms the deletion in the subsequent dialog
    Then the system redirects the User to the main Workspace list/dashboard
      And "Obsolete Project" is no longer visible in the Workspaces list

  Scenario: Failure to Rename Due to Duplicate Name
    Given the User owns two Workspaces, namely "Project X" and "Project Z"
    When the User selects the "Edit Name" option for "Project Z"
      And the User attempts to change its name to "Project X"
    Then the system displays the error message "That name is already used by another one of your workspaces"