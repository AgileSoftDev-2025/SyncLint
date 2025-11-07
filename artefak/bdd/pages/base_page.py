from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class BasePage:
    """Kelas dasar untuk semua Page Objects."""
    
    def __init__(self, driver, base_url="http://localhost:8000"):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def open(self, url):
        """Membuka URL."""
        self.driver.get(self.base_url + url)

    def find_element(self, locator):
        """Mencari elemen, menunggu hingga terlihat."""
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator):
        """Mengeklik elemen."""
        self.find_element(locator).click()

    def fill(self, locator, text):
        """Mengisi field input."""
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        """Mendapatkan teks dari elemen."""
        try:
            return self.find_element(locator).text
        except TimeoutException:
            return None

    def get_current_url(self):
        """Mendapatkan URL saat ini."""
        return self.driver.current_url

    def is_element_present(self, locator):
        """Memeriksa apakah elemen ada di DOM."""
        try:
            self.wait.until(EC.visibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False

    def is_element_not_present(self, locator):
        """Memeriksa apakah elemen tidak ada di DOM."""
        try:
            self.wait.until(EC.invisibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False

    def type(self, locator, text):
        """Alias untuk mengisi field input."""
        self.fill(locator, text)