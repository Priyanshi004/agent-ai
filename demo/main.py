import os
import traceback
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_community import CalendarToolkit

# Load variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# Enable CORS
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
api_key = os.getenv('GOOGLE_API_KEY')
print(f"DEBUG: Google API Key loaded: {api_key is not None}")

# Initialize LLM with Tools
llm_with_tools = None
try:
    if api_key and ("xxxxxxxx" not in api_key):
        # Use Gemini 1.5 Flash
        llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest", 
            google_api_key=api_key, 
            temperature=0
        )
        
        # Tools
        toolkit = CalendarToolkit()
        tools = toolkit.get_tools()
        
        # Bind tools (Modern LangChain pattern)
        llm_with_tools = llm.bind_tools(tools)
        print("LLM initialized successfully with tool binding.")
    else:
        print("WARNING: No valid Google API Key found. Running in Mock Mode.")
except Exception as e:
    print(f"Error initializing LLM: {e}")
    traceback.print_exc()

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        if llm_with_tools is None:
            return {"reply": f"[MOCK] Received: {request.message}. Please check your GOOGLE_API_KEY."}

        print(f"DEBUG: Request Message: {request.message}")
        
        # Invoke LLM
        res = llm_with_tools.invoke(request.message)
        
        # Extract content
        reply = res.content
        
        # Handle tool calls (if any)
        if res.tool_calls:
            # For now, we'll just return a message saying we see tool calls
            # Real tool execution would happen here
            tool_names = [tc['name'] for tc in res.tool_calls]
            reply = f"I need to use these tools: {', '.join(tool_names)}. (Tool execution is being optimized)."
        
        # Ensure it's a string
        if isinstance(reply, list):
            reply = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in reply])
            
        if not reply:
            reply = "I'm listening, how can I help?"

        print(f"DEBUG: AI Reply: {reply[:50]}...")
        return {"reply": reply}
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        traceback.print_exc()
        return {"reply": f"Sorry, I encountered an error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)