import os
import sqlite3
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Database Setup ---
DB_NAME = "agent_memory.db"

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if it doesn't exist."""
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS extracted_data (
            session_id TEXT PRIMARY KEY,
            data_json TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# --- Gemini API Interaction ---
def get_gemini_response(session_id, user_input):
    """
    Gets a response from the Gemini API based on conversation history.
    """
    
    # CORRECTED SECTION START
    system_prompt_text = """You are a friendly and highly efficient sales assistant for a recruitment agency named "RecruitGenie". Your goal is to understand the client's hiring needs, extract key information, and recommend the most suitable hiring service.

    **Your personality:** Professional, helpful, and concise.

    **Your process:**
    1.  Greet the user warmly if it's a new conversation.
    2.  Ask open-ended questions to understand their hiring requirements (e.g., "Tell me a bit about the roles you're looking to fill.").
    3.  From their free-form text, identify and extract the following details: industry, location, specific roles (including the count for each), and urgency.
    4.  Structure this information into a JSON object.
    5.  Formulate a helpful, conversational response.
    6.  Based on the extracted data, if you have enough information, suggest one of our hiring packages.
    7.  End your response by asking if they'd like a formal proposal or to schedule a call to discuss further.

    **JSON Structure for Extraction:**
    You MUST output a JSON object containing both your conversational response and the structured data. The JSON object should look like this:
    ```json
    {
      "response": "Your conversational reply to the user.",
      "extractedData": {
        "industry": "e.g., 'fintech', 'healthcare', 'unknown'",
        "location": "e.g., 'Mumbai', 'Remote', 'unknown'",
        "roles": [
          {"role": "e.g., 'backend engineer'", "count": 2},
          {"role": "e.g., 'UI/UX designer'", "count": 1}
        ],
        "urgency": "e.g., 'high', 'medium', 'low'"
      }
    }
    ```
    **Important Rules:**
    - ALWAYS return the JSON object in the specified format. Do not just return plain text.
    - If a piece of information isn't mentioned, use 'unknown' or an empty array [] for roles.
    - Do not make up information. Only extract what the user provides.
    - Keep your conversational response natural and helpful."""

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_prompt_text
    )
    # CORRECTED SECTION END
    
    # Fetch conversation history from DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, text FROM messages WHERE session_id = ? ORDER BY timestamp ASC", (session_id,)
    )
    history_rows = cursor.fetchall()
    conn.close()

    conversation_history = [{"role": row["role"], "parts": [{"text": row["text"]}]} for row in history_rows]

    generation_config = {"response_mime_type": "application/json"}
    
    # CORRECTED: The contents list no longer includes the system_instruction object
    contents = conversation_history + [{"role": "user", "parts": [{"text": user_input}]}]

    try:
        response = model.generate_content(contents, generation_config=generation_config)
        return json.loads(response.text)
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        fallback_response = {
            "response": "I'm having a bit of trouble connecting right now. Could you please try again in a moment?",
            "extractedData": {}
        }
        return fallback_response


# --- API Endpoints ---
@app.route('/chat', methods=['POST'])
def chat():
    """Handles the main chat interaction."""
    data = request.json
    session_id = data.get('sessionId')
    user_input = data.get('message')

    if not session_id or not user_input:
        return jsonify({"error": "sessionId and message are required"}), 400

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO messages (session_id, role, text) VALUES (?, ?, ?)",
        (session_id, 'user', user_input)
    )
    conn.commit()
    conn.close()

    gemini_data = get_gemini_response(session_id, user_input)
    model_response_text = gemini_data.get('response', "Sorry, I couldn't process that.")
    extracted_data = gemini_data.get('extractedData', {})

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO messages (session_id, role, text) VALUES (?, ?, ?)",
        (session_id, 'model', model_response_text)
    )
    conn.execute(
        "INSERT OR REPLACE INTO extracted_data (session_id, data_json) VALUES (?, ?)",
        (session_id, json.dumps(extracted_data))
    )
    conn.commit()
    conn.close()

    return jsonify({
        "response": model_response_text,
        "extractedData": extracted_data
    })

@app.route('/history/<session_id>', methods=['GET'])
def get_history(session_id):
    """Retrieves chat history for a given session."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, text, timestamp FROM messages WHERE session_id = ? ORDER BY timestamp ASC", (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    history = [{"role": row["role"], "text": row["text"], "id": row["timestamp"]} for row in rows]
    
    if not history:
        greeting = {
            "role": "model", 
            "text": "Hello! I'm your AI sales assistant from 'RecruitGenie'. How can I help you with your hiring needs today?",
            "id": "initial"
        }
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO messages (session_id, role, text) VALUES (?, ?, ?)",
            (session_id, greeting['role'], greeting['text'])
        )
        conn.commit()
        conn.close()
        history.append(greeting)

    return jsonify(history)

@app.route('/data/<session_id>', methods=['GET'])
def get_data(session_id):
    """Retrieves the latest extracted data for a given session."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM extracted_data WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(json.loads(row["data_json"]))
    return jsonify({})


# --- Main Execution ---
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001, debug=True)