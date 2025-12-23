import requests
import os

URL = "http://127.0.0.1:8000/api/analyze"
REF_FILE = "public/ref.mp3"
USER_FILE = "verification_scripts/user.mp3"

def test_api():
    if not os.path.exists(REF_FILE):
        print(f"Error: {REF_FILE} not found")
        return

    print(f"Sending request to {URL}...")
    try:
        files = {
            'ref_audio': open(REF_FILE, 'rb'),
            'user_audio': open(USER_FILE, 'rb')
        }
        response = requests.post(URL, files=files, timeout=60) # Local timeout
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response JSON:")
            print(response.json())
        else:
            print("Error Response:")
            print(response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_api()
