import os
import time
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from dotenv import load_dotenv
from gtts import gTTS
from io import BytesIO
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str

# Initialize Gemini Client
def get_gemini_client():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("Warning: GOOGLE_API_KEY not set")
        return None
    return genai.Client(http_options={'api_version': 'v1alpha'})

@app.get("/api/health")
def health_check():
    return {"status": "ok", "time": time.time()}

@app.post("/api/generate_reference")
async def generate_reference(request: TTSRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    if len(request.text) > 100:
        raise HTTPException(status_code=400, detail="Text exceeds 100 character limit")
    
    try:
        # Generate Audio in memory
        mp3_fp = BytesIO()
        tts = gTTS(text=request.text, lang='en')
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_audio(
    ref_audio: UploadFile = File(...), 
    user_audio: UploadFile = File(...),
    target_text: str = Form(...)
):
    start_time = time.time()
    
    client = get_gemini_client()
    if not client:
        raise HTTPException(status_code=500, detail="Server misconfiguration: API Key missing")

    try:
        # Read files
        ref_bytes = await ref_audio.read()
        user_bytes = await user_audio.read()

        # Check payload size roughly
        if len(ref_bytes) + len(user_bytes) > 4.5 * 1024 * 1024:
             raise HTTPException(status_code=413, detail="Payload too large (Max 4.5MB)")
        
        if len(target_text) > 100:
             raise HTTPException(status_code=400, detail="Text exceeds 100 character limit")

        prompt = f"""
        You are an expert phonetic coach for Japanese learners. 
        The student is trying to say: "{target_text}"
        
        Compare the Reference and User Audio directly using signal analysis. 
        Focus on Vowel Insertion (Katakana English), R/L/Th distinction, and Intonation.
        
        CRITICAL: Provide the 'fix_advice' and 'error_detail' strictly in JAPANESE.
        Explain HOW to move the tongue/lips physically to fix the error.
        """
        
        schema = {
            "type": "OBJECT",
            "properties": {
                "score": {"type": "INTEGER", "description": "0-100"},
                "issues": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "target_word": {"type": "STRING"},
                            "error_detail": {"type": "STRING", "description": "Error description in Natural Japanese"},
                            "fix_advice": {"type": "STRING", "description": "Physical instruction in Japanese (e.g. '舌先を...')"}
                        },
                        "required": ["target_word", "error_detail", "fix_advice"]
                    }
                }
            },
            "required": ["score", "issues"]
        }

        # Call Gemini
        # Note: 2.0 Flash Exp might be slow. 
        # We explicitly assume 'include_thoughts' off or default for speed.
        
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                        types.Part(inline_data=types.Blob(mime_type="audio/mp3", data=ref_bytes)),
                        types.Part(inline_data=types.Blob(mime_type="audio/mp3", data=user_bytes))
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema
            )
        )

        duration = time.time() - start_time
        print(f"Analysis completed in {duration:.2f}s")
        
        return json.loads(response.text)

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
import json
