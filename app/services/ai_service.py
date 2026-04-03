import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

def generate_hydration_insights(data: dict) -> str:
    if not model:
        return "Gemini API key not configured. Please add it to your .env file."

    total_intake = data.get("total_amount_ml", 0)
    entries_count = len(data.get("entries", []))
    user_name = data.get("user_name", "User")
    daily_goal = data.get("daily_goal", 2500)

    prompt = f"""
    You are a professional Hydration Coach for {user_name}. 
    They have logged their water intake for today.
    
    Data:
    - User Name: {user_name}
    - Daily Goal: {daily_goal} ml
    - Total intake today: {total_intake} ml
    - Number of logs: {entries_count}
    
    Please provide:
    1. Addressing the user by name, give two brief insights about their current hydration status relative to their goal.
    2. Two short, actionable suggestions tailored to their progress today.
    
    Keep the tone encouraging, high-end, and the response concise.
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating insights: {str(e)}"
