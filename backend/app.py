from flask import Flask, request, jsonify
import joblib
import numpy as np
import firebase_admin
from firebase_admin import credentials, db
import os
import json

app = Flask(__name__)

# ================= LOAD MODEL =================
model = joblib.load("ammonia_model_final.pkl")

# ================= FIREBASE INIT (RENDER SAFE) =================
firebase_config = os.environ.get("FIREBASE_CONFIG")

if not firebase_config:
    raise Exception("FIREBASE_CONFIG not set in environment variables")

cred = credentials.Certificate(json.loads(firebase_config))

# prevent duplicate initialization (Render fix)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://quailiotapp-default-southeast1.firebasedatabase.app"
    })

# ================= ROUTE =================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        print("\n🔥 RAW REQUEST DATA:", data)

        if not data:
            return jsonify({"error": "No JSON received"}), 400

        temp = float(data.get("temperature", 0))
        hum = float(data.get("humidity", 0))
        heat = float(data.get("heat", 0))

        print("📊 INPUT VALUES:", temp, hum, heat)

        # ================= ML PREDICTION =================
        features = np.array([[temp, hum, heat]])
        prediction = model.predict(features)[0]

        print("🤖 PREDICTION RESULT:", prediction)

        # ================= FIREBASE WRITE =================
        ref = db.reference("/sensors")

        ref.update({
            "ammonia_predict": float(prediction)
        })

        print("✅ SAVED TO FIREBASE SUCCESSFULLY")

        return jsonify({
            "ammonia_prediction": float(prediction),
            "status": "saved to firebase"
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


# ================= RUN SERVER (RENDER FIX) =================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)