from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime

bcrypt = Bcrypt()
jwt = JWTManager()

def init_auth(app):
    bcrypt.init_app(app)
    jwt.init_app(app)
    app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=7)

# User model
users = {}

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if email in users:
        return jsonify({"error": "User already exists"}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    users[email] = {
        'email': email,
        'password': hashed_password,
        'name': name,
        'id': len(users) + 1
    }
    
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = users.get(email)
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
    user = next((u for u in users.values() if u['id'] == user_id), None)
    if user:
        return jsonify({
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        })
    return jsonify({"error": "User not found"}), 404