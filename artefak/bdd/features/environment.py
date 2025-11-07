# File: features/environment.py
import time
from selenium import webdriver
from pages.login_page import LoginPage
from pages.signup_page import SignupPage
from pages.homepage_page import Homepage

def before_all(context):
    """Dipanggil sekali sebelum semua skenario dijalankan."""
    context.base_url = "http://127.0.0.1:8000" 
    
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') 
    context.driver = webdriver.Chrome(options=options)
    
    context.login_page = LoginPage(context.driver, context.base_url)
    context.signup_page = SignupPage(context.driver, context.base_url)
    context.homepage_page = Homepage(context.driver, context.base_url)

def after_all(context):
    """Dipanggil sekali setelah semua skenario selesai."""
    # context.driver.quit() # Commented out to keep browser open for debugging
