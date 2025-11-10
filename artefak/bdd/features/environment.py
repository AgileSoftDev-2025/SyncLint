from rest_framework.test import APIClient

def before_scenario(context, scenario):
    # Siapkan APIClient untuk setiap skenario
    context.client = APIClient()
