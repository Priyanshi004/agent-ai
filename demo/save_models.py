import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

with open('model_list.txt', 'w', encoding='utf-8') as f:
    try:
        print("Fetching models...", flush=True)
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
        print("Model list saved to model_list.txt", flush=True)
    except Exception as e:
        f.write(f"Error: {str(e)}\n")
        print(f"Error: {e}", flush=True)
