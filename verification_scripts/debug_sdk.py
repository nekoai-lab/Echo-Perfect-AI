from google import genai
from google.genai import types

print("Inspecting types.Part")
try:
    print(dir(types.Part))
    print(help(types.Part.from_bytes))
except Exception as e:
    print(e)
