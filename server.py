from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

SCORES_FILE = 'scores.json'

def load_scores():
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_scores(scores):
    with open(SCORES_FILE, 'w') as f:
        json.dump(scores, f)

@app.route('/scores', methods=['GET'])
def get_scores():
    scores = load_scores()
    return jsonify(scores)

@app.route('/scores', methods=['POST'])
def add_score():
    score = request.json
    # Přidání časového razítka pro lepší řazení
    score['timestamp'] = datetime.now().isoformat()
    scores = load_scores()
    scores.append(score)
    # Seřazení podle času (nejrychlejší první)
    scores.sort(key=lambda x: float(x['time']))
    save_scores(scores)
    return jsonify(scores)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 