from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from dataclasses import asdict
import uuid

from config import Config
from services import AIStudyBuddyBackend
from database import Database

# Flask Application Setup
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Authentication setup
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Initialize Backend Services
study_buddy = AIStudyBuddyBackend()
db = Database()

# Helper function to get user ID
def get_user_id():
    # In a real app with frontend sending JWT, we would use get_jwt_identity()
    # But for compatibility with current frontend which might send User-ID header or JWT
    # We'll try JWT first, then header
    try:
        identity = get_jwt_identity()
        if identity:
            return identity
    except:
        pass
    return request.headers.get('User-ID', 'user-123')

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if db.get_user_by_email(email):
        return jsonify({"error": "User already exists"}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user_id = str(uuid.uuid4())
    
    user_data = {
        'id': user_id,
        'email': email,
        'password': hashed_password,
        'name': name
    }
    
    if db.create_user(user_data):
        return jsonify({"message": "User created successfully"}), 201
    return jsonify({"error": "Registration failed"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = db.get_user_by_email(email)
    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=user['id'])
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name']
            }
        })
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = db.get_user_by_id(user_id)
    if user:
        return jsonify({
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        })
    return jsonify({"error": "User not found"}), 404

# API Routes
@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Study Buddy API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #4f46e5; }
            .endpoint { background: #f3f4f6; padding: 10px; margin: 5px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🤖 AI Study Buddy API</h1>
        <p>Server is running successfully! 🚀</p>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint"><strong>GET</strong> <a href="/api/health">/api/health</a> - Health check</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/user/profile">/api/user/profile</a> - Get user profile</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/sessions">/api/sessions</a> - Get study sessions</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/quiz/generate?topic=python&difficulty=easy">/api/quiz/generate</a> - Generate quiz</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/progress">/api/progress</a> - Get progress stats</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/motivation">/api/motivation</a> - Get motivation</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/study-plans">/api/study-plans</a> - Get study plans</div>
        
        <h2>Authentication Endpoints:</h2>
        <div class="endpoint"><strong>POST</strong> /api/auth/register - Register new user</div>
        <div class="endpoint"><strong>POST</strong> /api/auth/login - Login user</div>
        <div class="endpoint"><strong>GET</strong> /api/auth/me - Get current user (requires JWT)</div>
    </body>
    </html>
    '''

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "AI Study Buddy API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    })

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    user_id = get_user_id()
    profile = study_buddy.get_user_profile(user_id)
    if profile:
        return jsonify(asdict(profile))
    return jsonify({"error": "User not found"}), 404

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    user_id = get_user_id()
    profile_data = request.get_json()
    updated_profile = study_buddy.update_user_profile(user_id, profile_data)
    if updated_profile:
        return jsonify(asdict(updated_profile))
    return jsonify({"error": "User not found"}), 404

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    user_id = get_user_id()
    sessions = study_buddy.get_study_sessions(user_id)
    return jsonify([asdict(session) for session in sessions])

@app.route('/api/sessions', methods=['POST'])
def create_session():
    user_id = get_user_id()
    session_data = request.get_json()
    session = study_buddy.create_study_session(user_id, session_data)
    return jsonify(asdict(session))

@app.route('/api/sessions/<session_id>/end', methods=['PUT'])
def end_session(session_id):
    user_id = get_user_id()
    data = request.get_json()
    confidence_level = data.get('confidenceLevel', 5)
    
    session = study_buddy.end_study_session(user_id, session_id, confidence_level)
    if session:
        return jsonify(asdict(session))
    return jsonify({"error": "Session not found"}), 404

@app.route('/api/sessions/<session_id>/question', methods=['POST'])
def add_question(session_id):
    user_id = get_user_id()
    data = request.get_json()
    question = data.get('question')
    
    if question:
        answer = study_buddy.ask_ai(user_id, session_id, question)
        return jsonify({"message": "Question answered", "answer": answer})
    else:
        # Legacy behavior or just counting
        success = study_buddy.add_session_question(user_id, session_id)
        if success:
            return jsonify({"message": "Question counted"})
    
    return jsonify({"error": "Session not found"}), 404

@app.route('/api/quiz/generate', methods=['GET'])
def generate_quiz():
    topic = request.args.get('topic', 'python')
    difficulty = request.args.get('difficulty', 'easy')
    num_questions = int(request.args.get('numQuestions', 5))
    
    quiz_questions = study_buddy.generate_quiz(topic, difficulty, num_questions)
    return jsonify(quiz_questions)

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    questions = data.get('questions', [])
    answers = data.get('answers', {})
    return jsonify(stats)

@app.route('/api/motivation', methods=['GET'])
def get_motivation():
    message = study_buddy.get_motivational_message()
    return jsonify({"message": message})

@app.route('/api/ask-question', methods=['POST'])
def ask_question_endpoint():
    user_id = get_user_id()
    data = request.get_json()
    question = data.get('question')
    
    if not question:
        return jsonify({"error": "No question provided"}), 400

    # Use a generic session ID for the global chat
    # In a real app, we might want to track this better or create a "global" session per user
    answer = study_buddy.ask_ai(user_id, "global-chat", question)
    return jsonify({"answer": answer})

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    data = request.get_json()
    topic = data.get('topic')
    count = data.get('count', 5)
    
    flashcards = study_buddy.generate_flashcards(topic, count)
    return jsonify(flashcards), 200

@app.route('/api/study-plans', methods=['POST'])
def create_study_plan():
    user_id = get_user_id()
    plan_data = request.get_json()
    plan = study_buddy.create_study_plan(user_id, plan_data)
    return jsonify(asdict(plan)), 201

@app.route('/api/study-plans', methods=['GET'])
def get_study_plans():
    user_id = get_user_id()
    plans = study_buddy.get_study_plans(user_id)
    return jsonify([asdict(plan) for plan in plans])

@app.route('/api/study-plans/<plan_id>', methods=['DELETE'])
def delete_study_plan(plan_id):
    user_id = get_user_id()
    success = study_buddy.delete_study_plan(user_id, plan_id)
    if success:
        return jsonify({"message": "Study plan deleted successfully"})
    return jsonify({"error": "Failed to delete study plan"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)