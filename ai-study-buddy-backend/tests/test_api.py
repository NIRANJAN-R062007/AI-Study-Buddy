import sys
from unittest.mock import MagicMock
import pytest
import json

# Mock google.generativeai before importing app
mock_genai = MagicMock()
sys.modules['google.generativeai'] = mock_genai

from app import app, db, study_buddy
from models import UserProfile

import tempfile
import os

@pytest.fixture
def client():
    # Use a fixed file for testing to debug
    db_path = 'test_debug.db'
    if os.path.exists(db_path):
        os.remove(db_path)
    
    app.config['TESTING'] = True
    app.config['DB_PATH'] = db_path
    
    # Re-init db for testing
    db.db_path = db_path
    db.init_db()
    
    # Patch study_buddy service db
    study_buddy.db.db_path = db_path
    # No need to init_db again as it uses the same file, but we can to be safe or just update path
    # The tables are already created by db.init_db()
    
    with app.test_client() as client:
        yield client
    
    # Cleanup
    if os.path.exists(db_path):
        os.remove(db_path)

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def register_and_login(client):
    # Register
    user_data = {
        'email': 'test@example.com',
        'password': 'password123',
        'name': 'Test User'
    }
    response = client.post('/api/auth/register', json=user_data)
    assert response.status_code == 201
    
    # Login
    login_data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    response = client.post('/api/auth/login', json=login_data)
    assert response.status_code == 200
    assert 'access_token' in response.json
    
    return response.json['access_token']

def test_study_session_flow(client):
    # Register and login first
    token = register_and_login(client)
    headers = {'Authorization': f'Bearer {token}'}
    
    # Create session
    session_data = {'topic': 'python'}
    response = client.post('/api/sessions', json=session_data, headers=headers)
    assert response.status_code == 200
    session_id = response.json['id']
    
    # End session
    end_data = {'confidenceLevel': 8}
    response = client.put(f'/api/sessions/{session_id}/end', json=end_data, headers=headers)
    assert response.status_code == 200
    assert response.json['confidence_level'] == 8

def test_quiz_generation(client):
    response = client.get('/api/quiz/generate?topic=python&difficulty=easy')
    assert response.status_code == 200
    assert len(response.json) > 0
    assert 'question' in response.json[0]
