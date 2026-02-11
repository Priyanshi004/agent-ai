import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('GOOGLE_API_KEY')

models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-2.0-flash"]

for model in models_to_test:
    print(f"\nTesting model: {model}")
    try:
        llm = ChatGoogleGenerativeAI(model=model, google_api_key=api_key)
        res = llm.invoke("Hi")
        print(f"  SUCCESS: {res.content}")
        # If we find one that works, we can stop or just note it
    except Exception as e:
        print(f"  FAILED: {e}")
