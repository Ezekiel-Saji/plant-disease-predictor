from flask import Flask, request, jsonify
import requests
import base64

app = Flask(__name__)

# Hugging Face Space API endpoint
HF_API_URL = "https://ezekielsaji-plantdiseases.hf.space/api/predict/"

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # Read image and convert to base64
    img_bytes = request.files["image"].read()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    payload = {"data": [f"data:image/png;base64,{img_b64}"]}
    try:
        # Call HF Space Gradio API
        hf_response = requests.post(HF_API_URL, json=payload)
        hf_response.raise_for_status()
        hf_json = hf_response.json()
        print("📤 HF RAW RESPONSE:", hf_json)
        # Parse Gradio output
        # Gradio returns: {"data":[{"disease1":0.8, "disease2":0.15, ...}]}
        hf_data = hf_json.get("data", [{}])[0]

        if not hf_data:
            return jsonify({"error": "Invalid response from model"}), 500

        # Sort predictions by confidence
        sorted_preds = sorted(hf_data.items(), key=lambda x: x[1], reverse=True)

        top_pred = sorted_preds[0]
        all_preds_top5 = dict(sorted_preds[:5])

        # Convert confidence to percentage
        result = {
            "predicted_class": top_pred[0],
            "confidence": float(top_pred[1]) * 100,
            "all_predictions": {k: float(v) * 100 for k, v in all_preds_top5.items()}
        }

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)