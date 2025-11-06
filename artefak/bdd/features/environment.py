from selenium import webdriver
from pages.login_page import LoginPage
from pages.signup_page import SignupPage
from pages.homepage_page import Homepage
#from SyncLint.artefak.bdd.pages.homepage_page import HomepagePage

def before_all(context):
    """Dipanggil sekali sebelum semua skenario dijalankan."""
    # Tentukan base URL aplikasi Anda. HARUS disesuaikan.
    context.base_url = "http://localhost:8000" 
    
    # Setup WebDriver (contoh menggunakan Chrome)
    # Pastikan chromedriver ada di PATH Anda atau atur 'executable_path'
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') # Jalankan tanpa membuka jendela browser (opsional)
    context.driver = webdriver.Chrome(options=options)
    
    # Inisialisasi semua Page Objects di sini
    context.login_page = LoginPage(context.driver, context.base_url)
    context.signup_page = SignupPage(context.driver, context.base_url)
    context.homepage_page = Homepage(context.driver, context.base_url)

def after_all(context):
    """Dipanggil sekali setelah semua skenario selesai."""
    context.driver.quit()

def after_step(context, step):
    """Opsional: Ambil screenshot jika step gagal."""
    if step.status == "failed":
        context.driver.save_screenshot(f"screenshot_failed_{step.name}.png")