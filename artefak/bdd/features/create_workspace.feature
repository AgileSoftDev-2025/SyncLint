Feature: Creating a New Workspace
  As a logged-in user, I want to create a new workspace
  So that I can manage my project artifacts separately and in an organized manner.

  Background: User is logged in
    Given I am on the "Login" page
    When I enter email "aan@gmail.com" and password "hebat123"
    And I press the "Login" button
    Then I should be redirected to the "homepage"

  Scenario: Successful Workspace Creation
    Given I am on the homepage
    When the User clicks the "Create Workspace" button, fills the form with the Name "Project BDD"
    And the User clicks the "Create" button
    Then the workspace creation form/modal is closed
    And a new Workspace named "Project BDD" is displayed in the Workspace list

  