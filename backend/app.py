# from flask import Flask, request, jsonify
# import requests
# import base64

# app = Flask(__name__)

# # Hugging Face Space API endpoint
# HF_API_URL = "https://ezekielsaji-plantdiseases.hf.space/api/predict/"

# @app.route("/predict", methods=["POST"])
# def predict():
#     if "image" not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     # Read image and convert to base64
#     img_bytes = request.files["image"].read()
#     img_b64 = base64.b64encode(img_bytes).decode("utf-8")
#     payload = {"data": [f"data:image/png;base64,{img_b64}"]}
#     try:
#         # Call HF Space Gradio API
#         hf_response = requests.post(HF_API_URL, json=payload)
#         hf_response.raise_for_status()
#         hf_json = hf_response.json()
#         print("📤 HF RAW RESPONSE:", hf_json)
#         # Parse Gradio output
#         # Gradio returns: {"data":[{"disease1":0.8, "disease2":0.15, ...}]}
#         hf_data = hf_json.get("data", [{}])[0]

#         if not hf_data:
#             return jsonify({"error": "Invalid response from model"}), 500

#         # Sort predictions by confidence
#         sorted_preds = sorted(hf_data.items(), key=lambda x: x[1], reverse=True)

#         top_pred = sorted_preds[0]
#         all_preds_top5 = dict(sorted_preds[:5])

#         # Convert confidence to percentage
#         result = {
#             "predicted_class": top_pred[0],
#             "confidence": float(top_pred[1]) * 100,
#             "all_predictions": {k: float(v) * 100 for k, v in all_preds_top5.items()}
#         }

#         return jsonify(result)

#     except requests.exceptions.RequestException as e:
#         print("❌ ERROR:", e)
#         return jsonify({"error": str(e)}), 500
    

# if __name__ == "__main__":
#     app.run(host="127.0.0.1", port=5000, debug=True)



from flask import Flask, request, jsonify
from gradio_client import Client, handle_file
import tempfile
import os

app = Flask(__name__)

# Hugging Face Space name
HF_SPACE_NAME = "ezekielsaji/plantdiseases"

# Initialize the Gradio client outside the route for efficiency
try:
    client = Client(HF_SPACE_NAME)
    # Optional: Print the API documentation to understand the inputs and outputs
    # print(client.view_api()) 
except Exception as e:
    print(f"❌ ERROR: Could not initialize Gradio client. Make sure the Space name is correct: {e}")
    client = None

@app.route("/predict", methods=["POST"])
def predict():
    if not client:
        return jsonify({"error": "Gradio client not initialized"}), 500

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # Save the uploaded file to a temporary location
    try:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
            request.files["image"].save(temp_file.name)
            temp_file_path = temp_file.name
        
        # Call the Gradio API using the client
        # The `api_name` should be "/predict" unless your Gradio app
        # has a custom-named function.
        hf_response = client.predict(
            image=handle_file(temp_file_path),
            api_name="/predict"
        )
        
        # The Gradio client returns the raw output from your Gradio function.
        # Your model's output is likely a dictionary of predictions,
        # but you should verify this by checking your Gradio app's code.
        print("📤 HF RAW RESPONSE:", hf_response)
        
        # Assuming your Gradio function returns a single dictionary of predictions
        # if isinstance(hf_response, dict):
        predictions = hf_response
        # else:
        #     # Handle cases where the Gradio function returns a list
        #     predictions = hf_response[0] if isinstance(hf_response, list) and hf_response else {}

        # if not predictions:
        #     return jsonify({"error": "Invalid response from model"}), 500

        # # Sort predictions by confidence
        # sorted_preds = sorted(predictions.items(), key=lambda x: x[1], reverse=True)

        # top_pred = sorted_preds[0]
        # all_preds_top5 = dict(sorted_preds[:5])

        # Convert confidence to percentage
        sorted_preds = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
        top_pred = sorted_preds[0]
        all_preds_top5 = dict(sorted_preds[:5])

        # Convert confidence to percentage
        result = {
            "predicted_class": top_pred[0],
            "confidence": float(top_pred[1]) * 100,
            "all_predictions": {k: float(v) * 100 for k, v in all_preds_top5.items()}
        }


        return jsonify(result)

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the temporary file
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)