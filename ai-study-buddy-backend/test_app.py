from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Flask is working!"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    print("🔍 Starting Flask test server...")
    print("📍 Testing basic routing...")
    app.run(debug=True, port=8000, host='0.0.0.0')