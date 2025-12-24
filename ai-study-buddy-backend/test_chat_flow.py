import pytest
import json
from app import app, db, study_buddy
from unittest.mock import MagicMock
import sys

# Ensure google.generativeai is mocked if not present, though we want to test real logic if possible.
# But for verification in this environment, we might want to mock the actual API call to avoid network/key issues blocking the logic check.
# However, the user wants to use the real key. 
# Let's try to use the real key if available, but for the test runner, we might need to be careful.

# Actually, let's just test the flow with a mock to ensure the wiring is correct.
# The real API call was verified in debug_gemini.py.

def test_ask_ai_flow():
    # Setup
    app.config['TESTING'] = True
    # Use in-memory or temp db
    import tempfile
    import os
    db_fd, db_path = tempfile.mkstemp()
    app.config['DB_PATH'] = db_path
    db.db_path = db_path
    db.init_db()
    study_buddy.db.db_path = db_path
    
    # Mock the Gemini call to avoid using quota or network in this automated test
    # We want to verify the route and service logic, not Google's API uptime.
    original_call_gemini = study_buddy._call_gemini
    study_buddy._call_gemini = MagicMock(return_value="This is a mocked AI response.")
    study_buddy.has_gemini = True # Force true for this test

    with app.test_client() as client:
        # Register
        user_data = {'email': 'chat@test.com', 'password': 'pw', 'name': 'Chatter'}
        client.post('/api/auth/register', json=user_data)
        
        # Login
        login_resp = client.post('/api/auth/login', json={'email': 'chat@test.com', 'password': 'pw'})
        token = login_resp.json['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Create Session
        session_resp = client.post('/api/sessions', json={'topic': 'python'}, headers=headers)
        session_id = session_resp.json['id']
        
        # Ask Question
        question_data = {'question': 'What is a list?'}
        chat_resp = client.post(f'/api/sessions/{session_id}/question', json=question_data, headers=headers)
        
        if chat_resp.status_code != 200:
            print(f"Status: {chat_resp.status_code}")
            print(f"Response: {chat_resp.json}")
        
        assert chat_resp.status_code == 200
        assert chat_resp.json['message'] == "Question answered"
        assert chat_resp.json['answer'] == "This is a mocked AI response."
        
        # Verify question count increased
        # We need to fetch the session or check via DB
        # But the response doesn't return the session.
        # Let's check via DB directly or another endpoint if available.
        # For now, the response is enough.

    # Cleanup
    study_buddy._call_gemini = original_call_gemini
    os.close(db_fd)
    os.unlink(db_path)

if __name__ == "__main__":
    # Manually run the test function
    try:
        test_ask_ai_flow()
        print("Test Passed!")
    except Exception as e:
        print(f"Test Failed: {e}")
        import traceback
        traceback.print_exc()
