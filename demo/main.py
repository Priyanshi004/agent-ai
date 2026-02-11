import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_google_community import CalendarToolkit

# Load variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
)

# Enable CORS for Flutter browser client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Check if the key is actually loaded
api_key = os.getenv('OPENAI_API_KEY')
print(f"DEBUG: OpenAI Key loaded: {api_key is not None}")

# Initialize LLM and Tools
llm = None
tools = []
agent_executor = None

try:
    if not api_key or ("sk-proj" in api_key and "xxxx" in api_key):
        print("WARNING: OpenAI API Key is missing or placeholder. Running in Mock Mode.")
    else:
        llm = ChatOpenAI(model="gpt-4o", temperature=0)
        toolkit = CalendarToolkit()
        tools = toolkit.get_tools()
        
        # Create agent using the new 1.x factory
        agent_executor = create_agent(llm, tools=tools)
        print("AI Agent initialized successfully.")
except Exception as e:
    print(f"WARNING: Could not initialize AI Agent (this is expected in Mock Mode): {e}")
    # We continue so the FastAPI server can still run and provide mock responses

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Check if we are in Mock Mode (placeholder key or failed init)
        if agent_executor is None or (api_key and ("sk-proj" in api_key and "xxxx" in api_key)):
            return {"reply": f"[MOCK MODE] I received your message: '{request.message}'. Since no valid OpenAI API Key is provided, I'm responding in simulation mode. Once you add a key to .env, I'll be able to use my full AI capabilities!"}

        # Use 'messages' key for LangGraph agent
        result = agent_executor.invoke({"messages": [("user", request.message)]})
        # The result includes the full message history; extract the last AI message
        reply = result["messages"][-1].content
        return {"reply": reply}
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        # Secondary fallback if the invoke fails due to connection/auth
        if "api_key" in str(e).lower() or "connection" in str(e).lower():
             return {"reply": "[ERROR/MOCK] I couldn't connect to OpenAI. Please verify your API Key in .env. (Message received: " + request.message + ")"}
        return {"reply": f"Sorry, I encountered an error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    # This keeps the script running and waits for Flutter to connect
    uvicorn.run(app, host="0.0.0.0", port=8000)