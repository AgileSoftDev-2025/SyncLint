from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from .base_page import BasePage
from selenium.common.exceptions import TimeoutException

class Homepage(BasePage):
    """Page Object untuk halaman homepage"""

    URL_PATH = "/api/homepage/"
    
    # Locators
    CREATE_WORKSPACE_BUTTON = (By.CLASS_NAME, "add-btn")
    WORKSPACE_MODAL = (By.ID, "workspaceModal")
    WORKSPACE_NAME_INPUT = (By.ID, "workspaceName")
    CREATE_CONFIRM_BUTTON = (By.ID, "createWorkspaceBtn")
    RENAME_CONFIRM_BUTTON = (By.ID, "renameWorkspaceBtn")
    DELETE_CONFIRM_BUTTON = (By.ID, "confirmDeleteBtn")
    WORKSPACE_LIST = (By.CLASS_NAME, "grid")

    def click_create_workspace(self):
        """Mengeklik tombol 'Create Workspace'."""
        self.click(self.CREATE_WORKSPACE_BUTTON)
    def get_form_error_message(self):
        """Mendapatkan pesan error dari alert."""
        try:
            alert = self.wait.until(EC.alert_is_present())
            message = alert.text
            alert.accept()  # Dismiss the alert
            return message
        except TimeoutException:
            return None

    def is_workspace_visible(self, name):
        """Memeriksa apakah workspace dengan nama tertentu terlihat."""
        workspace_locator = (By.XPATH, f"//div[@class='card-title' and text()='{name}']")
        return self.is_element_present(workspace_locator)

    def is_workspace_not_visible(self, name):
        """Memeriksa apakah workspace dengan nama tertentu tidak terlihat."""
        workspace_locator = (By.XPATH, f"//div[@class='card-title' and text()='{name}']")
        return self.is_element_not_present(workspace_locator)

    def fill_workspace_name(self, name):
        """Mengisi nama workspace pada input field."""
        self.fill(self.WORKSPACE_NAME_INPUT, name)

    def click_create_confirm(self):
        """Mengeklik tombol 'Create' di modal pembuatan workspace."""
        self.click(self.CREATE_CONFIRM_BUTTON)

    def is_create_modal_closed(self):
        """Memeriksa apakah modal pembuatan workspace sudah tertutup."""
        return self.is_element_not_present(self.WORKSPACE_MODAL)

    def click_workspace_menu(self, name):
        """Mengeklik menu (3-dots) pada workspace tertentu."""
        menu_locator = (By.XPATH, f"//div[@class='card-title' and text()='{name}']/ancestor::div[@class='card']//div[@class='menu-dot']")
        self.click(menu_locator)

    def click_rename_option(self):
        """Mengeklik opsi 'rename' dari menu."""
        # Asumsi: Opsi rename muncul setelah klik menu. Ganti locator jika perlu.
        rename_locator = (By.XPATH, "//div[contains(@class, 'menu')]//div[text()='Rename']")
        self.click(rename_locator)

    def click_rename_confirm(self):
        """Mengeklik tombol 'Ganti Nama' di modal."""
        self.click(self.RENAME_CONFIRM_BUTTON)

    def click_delete_option(self):
        """Mengeklik opsi 'delete' dari menu."""
        # Asumsi: Opsi delete muncul setelah klik menu. Ganti locator jika perlu.
        delete_locator = (By.XPATH, "//div[contains(@class, 'menu')]//div[text()='Delete']")
        self.click(delete_locator)

    def click_delete_confirm(self):
        """Mengeklik tombol 'Hapus' di modal konfirmasi."""
        self.click(self.DELETE_CONFIRM_BUTTON)

    def create_workspace_if_not_exists(self, name):
        """Membuat workspace jika belum ada (untuk setup Given)."""
        if not self.is_workspace_visible(name):
            self.click_create_workspace()
            self.fill_workspace_name(name)
            self.click_create_confirm()
            # Tunggu modal tertutup
            self.is_create_modal_closed()
