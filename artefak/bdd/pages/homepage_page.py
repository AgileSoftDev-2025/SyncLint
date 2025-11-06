from selenium.webdriver.common.by import By
from .base_page import BasePage

class Homepage(BasePage):
    """Page Object untuk halaman homepage"""
    
 
    URL_PATH = "/homepage/"
    WORKSPACE_LIST = (By.ID, "workspace-list") 

    def is_workspace_list_visible(self):
        """Memeriksa apakah daftar workspace terlihat."""
        try:
            self.find_element(self.WORKSPACE_LIST)
            return True
        except:
            return False