from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="EthicAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are EthicAI, a professional AI assistant specializing in cyber ethics, digital safety, professional ethics, human values, responsible AI, privacy, and online behavior.

You can answer ANY question freely and intelligently on any topic.

Follow these rules:
- REFUSE to help with hacking, unauthorized access, harassment, or illegal activities
- Explain WHY something is unethical when declining
- Suggest ethical alternatives when refusing

After every response append this exact block at the very end:
<ETHICS_DATA>
{
  "ethical_score": <0-100>,
  "risk_level": "<None|Low|Medium|High>",
  "sentiment": "<Helpful|Educational|Supportive|Protective|Professional>",
  "principles": ["<principle1>", "<principle2>", "<principle3>"],
  "category": "<General|Cyber Ethics|AI Ethics|Privacy Ethics|Academic Ethics|Digital Safety|Harmful Request>",
  "why": "<one sentence explaining your response approach>"
}
</ETHICS_DATA>"""

class ChatRequest(BaseModel):
    message: str
    history: list = []

def parse_response(raw: str):
    if "<ETHICS_DATA>" in raw and "</ETHICS_DATA>" in raw:
        text_part = raw[:raw.index("<ETHICS_DATA>")].strip()
        json_part = raw[raw.index("<ETHICS_DATA>")+13:raw.index("</ETHICS_DATA>")].strip()
        try:
            data = json.loads(json_part)
            return text_part, data
        except:
            return text_part, None
    return raw.strip(), None

@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for h in req.history[-10:]:
            messages.append({
                "role": "assistant" if h["role"] == "ai" else "user",
                "content": h["content"]
            })

        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )

        raw = response.choices[0].message.content
        text, ethics = parse_response(raw)

        return {
            "response": text if text else "Could not generate a response. Please try again.",
            "ethical_score": ethics.get("ethical_score", 88) if ethics else 88,
            "risk_level": ethics.get("risk_level", "None") if ethics else "None",
            "sentiment": ethics.get("sentiment", "Helpful") if ethics else "Helpful",
            "principles": ethics.get("principles", ["Helpfulness"]) if ethics else ["Helpfulness"],
            "category": ethics.get("category", "General") if ethics else "General",
            "why": ethics.get("why", "") if ethics else ""
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "response": f"Backend error: {str(e)}",
            "ethical_score": 0,
            "risk_level": "None",
            "sentiment": "Error",
            "principles": [],
            "category": "Error",
            "why": str(e)
        }

@app.get("/")
def root():
    return {"status": "EthicAI running with Groq + LLaMA3"}