from selenium.webdriver.common.by import By
from .base_page import BasePage

class LoginPage(BasePage):
    """Page Object untuk halaman Login."""
    
    # Locators
    URL_PATH = "/api/login/"
    EMAIL_INPUT = (By.NAME, "username") 
    PASSWORD_INPUT = (By.NAME, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[text()='submit']")
    NON_FIELD_ERROR = (By.CSS_SELECTOR, 'div[style*="color: red"]') 
    SUCCESS_MESSAGE = (By.CSS_SELECTOR, '.messages li') 

    def open_page(self):
        """Membuka halaman login."""
        self.open(self.URL_PATH)

    def fill_email(self, email):
        """Mengisi field email."""
        self.fill(self.EMAIL_INPUT, email)

    def fill_password(self, password):
        """Mengisi field password."""
        self.fill(self.PASSWORD_INPUT, password)

    def click_login(self):
        """Mengeklik tombol login."""
        self.click(self.LOGIN_BUTTON)
    
    def get_error_message(self):
        """Mendapatkan pesan error non-field (cth: kredensial salah)."""
        return self.get_text(self.NON_FIELD_ERROR)

    def get_success_message(self):
        """Mendapatkan pesan sukses (cth: setelah registrasi)."""
        return self.get_text(self.SUCCESS_MESSAGE)