import os
import sys
from google import genai
from dotenv import load_dotenv

load_dotenv()

log_file = "model_log.txt"

with open(log_file, "w") as f:
    f.write("Starting Probe...\n")
    try:
        client = genai.Client(http_options={'api_version': 'v1alpha'})
        f.write("Client initialized.\n")
        
        f.write("--- Listing Models ---\n")
        try:
            for m in client.models.list():
                name = getattr(m, 'name', 'Unknown')
                display = getattr(m, 'display_name', 'Unknown')
                f.write(f"Found: {name} | {display}\n")
        except Exception as e:
            f.write(f"List failed: {e}\n")

        f.write("\n--- Probing Candidates ---\n")
        candidates = [
            "gemini-3-flash", 
            "gemini-3.0-flash", 
            "gemini-3.0-flash-preview", 
            "gemini-3.0-flash-001",
            "gemini-exp-1219",
            "gemini-2.0-flash-exp",
            "gemini-experimental"
        ]
        
        for mid in candidates:
            try:
                client.models.generate_content(model=mid, contents="test")
                f.write(f"VALID: {mid}\n")
            except Exception as e:
                if "404" in str(e) or "NOT_FOUND" in str(e):
                    f.write(f"INVALID (404): {mid}\n")
                else:
                    f.write(f"ERROR (Other): {mid} -> {e}\n")

    except Exception as e:
        f.write(f"Fatal Error: {e}\n")
