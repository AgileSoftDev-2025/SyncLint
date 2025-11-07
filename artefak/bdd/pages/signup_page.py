from selenium.webdriver.common.by import By
from .base_page import BasePage

class SignupPage(BasePage):
    """Page Object untuk halaman Sign Up."""

    # Locators
    URL_PATH = "/api/signup/"
    FIRST_NAME_INPUT = (By.NAME, "first_name")
    LAST_NAME_INPUT = (By.NAME, "last_name")
    EMAIL_INPUT = (By.ID, "email")
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    PASSWORD_CONFIRM_INPUT = (By.ID, "password_confirm")
    SIGNUP_BUTTON = (By.ID, "signupBtn")
    ERROR_MESSAGE_BLOCK = (By.CSS_SELECTOR, 'div[style*="color: red"]')

    def open_page(self):
        """Membuka halaman sign up."""
        self.open(self.URL_PATH)

    def fill_first_name(self, first_name):
        """Mengisi field nama depan."""
        self.fill(self.FIRST_NAME_INPUT, first_name)

    def fill_last_name(self, last_name):
        """Mengisi field nama belakang."""
        self.fill(self.LAST_NAME_INPUT, last_name)

    def fill_email(self, email):
        """Mengisi field email."""
        self.fill(self.EMAIL_INPUT, email)

    def fill_username(self, username):
        """Mengisi field username."""
        self.fill(self.USERNAME_INPUT, username)

    def fill_password(self, password):
        """Mengisi field password."""
        self.fill(self.PASSWORD_INPUT, password)

    def fill_password_confirm(self, password):
        """Mengisi field konfirmasi password."""
        self.fill(self.PASSWORD_CONFIRM_INPUT, password)

    def click_signup(self):
        """Mengeklik tombol sign up."""
        self.click(self.SIGNUP_BUTTON)

    def get_error_message(self):
        """Mendapatkan teks dari blok error."""
        return self.get_text(self.ERROR_MESSAGE_BLOCK)