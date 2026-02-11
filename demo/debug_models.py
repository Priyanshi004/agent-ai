import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('GOOGLE_API_KEY')
print(f"API Key present: {bool(api_key)}")

try:
    genai.configure(api_key=api_key)
    print("Listing available models via google.generativeai:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"MODEL: {m.name}")
except Exception as e:
    print(f"Error listing models with genai: {e}")
