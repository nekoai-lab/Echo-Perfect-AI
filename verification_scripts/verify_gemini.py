import os
import time
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Key check
if "GOOGLE_API_KEY" not in os.environ:
    print("Error: GOOGLE_API_KEY environment variable is not set.")
    print("Please create a .env file and set GOOGLE_API_KEY.")
    exit(1)

try:
    client = genai.Client(http_options={'api_version': 'v1alpha'})
except Exception as e:
    print(f"Failed to initialize client: {e}")
    exit(1)

# Model ID
MODEL_ID = "gemini-3-flash-preview" 

def verify_gemini_ears(ref_path, user_path):
    print(f"\n--- Verifying with Reference: {ref_path}, User: {user_path} ---")
    
    if not os.path.exists(ref_path):
        print(f"Error: Reference file not found at {ref_path}")
        return
    if not os.path.exists(user_path):
        print(f"Error: User file not found at {user_path}")
        return

    try:
        # Load audio
        with open(ref_path, "rb") as f: ref_data = f.read()
        with open(user_path, "rb") as f: user_data = f.read()

        prompt = """
        You are an expert phonetic coach. Compare the Reference and User Audio directly using signal analysis. 
        Focus on Vowel Insertion and R/L/Th distinction.
        """
        
        # Schema definition (v2.1)
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
                            "error_detail": {"type": "STRING", "description": "e.g. Vowel insertion detected"},
                            "fix_advice": {"type": "STRING"}
                        },
                        "required": ["target_word", "error_detail", "fix_advice"]
                    }
                }
            },
            "required": ["score", "issues"]
        }

        print("Sending request to Gemini... (Timing started)")
        start_time = time.time()
        
        # Configure for Speed (Hobby Plan Optimization)
        # Thinking is implicit in 2.0 Flash Exp for now, but we'll request JSON directly.
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                        types.Part(
                            inline_data=types.Blob(
                                mime_type="audio/mp3",
                                data=ref_data
                            )
                        ),
                        types.Part(
                            inline_data=types.Blob(
                                mime_type="audio/mp3",
                                data=user_data
                            )
                        )
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema
            )
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"Response received in {duration:.2f} seconds.")
        print("-" * 30)
        print(response.text)
        print("-" * 30)
        
        if duration > 10.0:
            print("WARNING: Response time exceeded 10 seconds! This will timeout on Vercel Hobby.")
        else:
            print("SUCCESS: Response time within Vercel Hobby limits.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Expects ref.mp3 and user.mp3 in the current directory
    verify_gemini_ears("ref.mp3", "user.mp3")
