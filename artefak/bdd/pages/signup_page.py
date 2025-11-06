from selenium.webdriver.common.by import By
from .base_page import BasePage

class SignupPage(BasePage):
    """Page Object untuk halaman Sign Up."""
    
    # Locators
    URL_PATH = "/api/signup/"
    EMAIL_INPUT = (By.NAME, "email")
    USERNAME_INPUT = (By.NAME, "username")
    PASSWORD_INPUT = (By.NAME, "password1")
    CONFIRM_PASSWORD_INPUT = (By.NAME, "password2")
    SIGNUP_BUTTON = (By.XPATH, "//button[text()='Daftar']")
    ERROR_MESSAGE_BLOCK = (By.CSS_SELECTOR, 'div[style*="color: #a94442"]') 

    def open_page(self):
        """Membuka halaman sign up."""
        self.open(self.URL_PATH)

    def fill_email(self, email):
        """Mengisi field email."""
        self.fill(self.EMAIL_INPUT, email)

    def fill_username(self, username):
        """Mengisi field username."""
        self.fill(self.USERNAME_INPUT, username)

    def fill_password(self, password):
        """Mengisi field password."""
        self.fill(self.PASSWORD_INPUT, password)

    def fill_confirm_password(self, password):
        """Mengisi field konfirmasi password."""
        self.fill(self.CONFIRM_PASSWORD_INPUT, password)

    def click_signup(self):
        """Mengeklik tombol sign up."""
        self.click(self.SIGNUP_BUTTON)

    def get_error_message(self):
        """Mendapatkan teks dari blok error."""
        return self.get_text(self.ERROR_MESSAGE_BLOCK)