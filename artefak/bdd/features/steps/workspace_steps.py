from behave import given, when, then

# --- Mock System Setup ---

class MockSystem:
    """A simple simulation of the application's business logic and state."""
    def __init__(self):
        # Existing data in the 'database'
        self.workspaces = {"Project Beta", "Old Report", "Project X", "Project Z", "Obsolete Project"}
        self.current_view = "Workspace List"
        self.error_message = ""

    def create_workspace(self, name):
        """Creates a workspace, checking for name duplication."""
        if name in self.workspaces:
            self.error_message = "Workspace name already in use, please choose another name"
            return False
        else:
            self.workspaces.add(name)
            return True

    def rename_workspace(self, old_name, new_name):
        """Renames a workspace, checking for duplication."""
        # Check if the new name is already used by another workspace
        if new_name in self.workspaces and new_name != old_name:
            self.error_message = "That name is already used by another one of your workspaces"
            return False
        
        if old_name in self.workspaces:
            self.workspaces.remove(old_name)
            self.workspaces.add(new_name)
            return True
        return False

    def delete_workspace(self, name):
        """Deletes a workspace."""
        if name in self.workspaces:
            self.workspaces.remove(name)
            self.current_view = "Workspace List"
            return True
        return False

# --- GIVEN Steps ---

@given('the User is logged in to the SyncLint application and viewing the Workspace list')
def step_impl(context):
    context.system = MockSystem()
    context.new_workspace_name = None

@given('a Workspace named "{name}" already exists in the system')
def step_impl(context, name):
    context.system = MockSystem()
    context.system.workspaces.add(name)

@given('the User is logged in and viewing a Workspace named "{name}"')
def step_impl(context, name):
    context.system = MockSystem()
    context.initial_workspace_name = name

@given('the User owns two Workspaces, namely "{name1}" and "{name2}"')
def step_impl(context, name1, name2):
    context.system = MockSystem()
    context.system.workspaces = {name1, name2}
    context.initial_workspace_name = name2 # Target for renaming/editing

@given('the User owns a Workspace named "{name}" which contains artifacts')
def step_impl(context, name):
    context.system = MockSystem()
    context.delete_target_name = name


# --- WHEN Steps (User Actions) ---

@when('the User clicks the "Create Workspace" button, fills the form with the Name "{name}"')
def step_impl(context, name):
    context.new_workspace_name = name

@when('the User clicks the "Create" button')
def step_impl(context):
    context.success = context.system.create_workspace(context.new_workspace_name)

@when('the User attempts to create a new Workspace named "{name}"')
def step_impl(context, name):
    context.success = context.system.create_workspace(name)
    context.attempted_name = name

@when('the User selects the 3-dots menu, clicks the "rename" option')
def step_impl(context):
    pass # UI simulation: open rename dialog

@when('the User enters the new name "{new_name}"')
def step_impl(context, new_name):
    context.renamed_to = new_name
    # Rename action is simulated here
    context.success = context.system.rename_workspace(context.initial_workspace_name, new_name)

@when('the User clicks the "Rename" button')
def step_impl(context):
    pass # Action already performed in the previous step

@when('the User selects the "Edit Name" option for "{name}"')
def step_impl(context, name):
    context.initial_workspace_name = name # Set the correct rename target

@when('the User attempts to change its name to "{new_name}"')
def step_impl(context, new_name):
    # Use the target set in the previous step
    context.renamed_to = new_name
    context.success = context.system.rename_workspace(context.initial_workspace_name, new_name)

@when('the User selects the "Delete Workspace" option for "{name}"')
def step_impl(context, name):
    context.delete_target_name = name

@when('the User confirms the deletion in the subsequent dialog')
def step_impl(context):
    context.success = context.system.delete_workspace(context.delete_target_name)


# --- THEN Steps (Verification) ---

@then('the workspace creation form/modal is closed')
def step_impl(context):
    assert context.success is True, f"Workspace creation failed: {context.system.error_message}"

@then('a new Workspace named "{name}" is displayed in the Workspace list')
def step_impl(context, name):
    assert name in context.system.workspaces, f"Workspace '{name}' was not found in the list."

@then('the system displays the error message "{error_message}"')
def step_impl(context, error_message):
    assert context.success is False, "The system was expected to fail, but succeeded."
    assert context.system.error_message == error_message, \
        f"Incorrect error message. Expected: '{error_message}', Received: '{context.system.error_message}'"

@then('the Workspace name displayed on the screen changes to "{new_name}"')
def step_impl(context, new_name):
    assert context.success is True, f"Rename failed: {context.system.error_message}"
    assert new_name in context.system.workspaces, f"New name '{new_name}' not found."
    assert context.initial_workspace_name not in context.system.workspaces, f"Old name '{context.initial_workspace_name}' is still present."

@then('the name "{new_name}" is reflected in the main Workspace list')
def step_impl(context, new_name):
    assert new_name in context.system.workspaces, f"New name '{new_name}' is not reflected in the main list."

@then('the system redirects the User to the main Workspace list/dashboard')
def step_impl(context):
    assert context.success is True, "Deletion failed."
    assert context.system.current_view == "Workspace List", "User was not redirected to the dashboard."

@then('"{name}" is no longer visible in the Workspaces list')
def step_impl(context, name):
    assert context.success is True, "Deletion failed."
    assert name not in context.system.workspaces, f"Workspace '{name}' is still visible in the list."