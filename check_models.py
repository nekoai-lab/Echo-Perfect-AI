import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

print("------ Model Probe & List Tool ------")

try:
    client = genai.Client(http_options={'api_version': 'v1alpha'})
    print("Client initialized.")
    
    # Method 1: List (might fail if SDK/Auth issue)
    print("\n--- Listing Models ---")
    try:
        # Note: In some SDK versions client.models.list() returns an iterable
        for m in client.models.list():
             # Accessing name carefully
             name = getattr(m, 'name', 'Unknown')
             display = getattr(m, 'display_name', 'Unknown')
             print(f"Found: {name} | {display}")
    except Exception as e:
        print(f"List failed: {e}")

    # Method 2: Probe specific IDs
    candidates = [
        "gemini-3-flash", 
        "gemini-3.0-flash",
        "gemini-3.0-flash-preview",
        "gemini-3.0-flash-exp",
        "gemini-3.0-flash-001",
        "gemini-exp-1219",
        "gemini-2.0-flash-exp"
    ]
    print("\n--- Probing Candidates ---")
    for model_id in candidates:
        try:
            # Minimal generation request
            client.models.generate_content(model=model_id, contents="test")
            print(f"✅ VALID: {model_id}")
        except Exception as e:
            err_str = str(e)
            if "404" in err_str or "NOT_FOUND" in err_str:
                print(f"❌ 404: {model_id}")
            else:
                print(f"⚠️  Error ({model_id}): {err_str}")

except Exception as e:
    print(f"Fatal error: {e}")
print("-----------------------------------")
