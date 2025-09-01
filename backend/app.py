from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client, file
import os
import uuid # To create unique filenames

app = Flask(__name__)
CORS(app)

# --- THE DEFINITIVE FIX ---
# We will use the official Gradio Python client.
# This is the most reliable way to connect to any HF Space,
# as it does not depend on the unpredictable REST API endpoints.
# It finds the correct API name and function to call automatically.
try:
    print("Initializing Gradio client...")
    client = Client("ezekielsaji/plantdiseases")
    print("Gradio client initialized successfully.")
except Exception as e:
    # This will catch errors if the space is down on startup.
    print(f"FATAL: Failed to initialize Gradio client: {e}")
    client = None

# Create a temporary directory for file handling
TEMP_DIR = "temp_uploads"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)



@app.route("/predict", methods=["POST"])
def predict():
    # Check if the client was initialized correctly on startup
    if not client:
        return jsonify({"error": "Gradio client is not available. Check server startup logs."}), 503

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    
    # The gradio_client requires a file path, so we save the uploaded file temporarily.
    filename = f"{uuid.uuid4()}-{image_file.filename}"
    temp_filepath = os.path.join(TEMP_DIR, filename)
    
    try:
        image_file.save(temp_filepath)

        # The .predict() method intelligently calls the right function in the Gradio app.
        # We pass the filepath to the 'image' parameter, which corresponds to the
        # Image component in the Gradio UI.
        print(f"Sending {temp_filepath} to Gradio client for prediction...")
        result = client.predict(image=file(temp_filepath))
        print(f"Received result from Gradio client: {result}")

        # The client returns the data structure from the Gradio app's output component.
        # For a "Label" output, this is usually a dictionary with a 'confidences' key.
        # e.g., {'label': 'Apple___scab', 'confidences': [{'label': 'Apple___scab', 'confidence': 0.9}, ...]}
        
        # Check if the expected 'confidences' key exists and is a list
        if 'confidences' not in result or not isinstance(result['confidences'], list):
            return jsonify({"error": "Invalid response format from model. 'confidences' not found.", "data_received": result}), 500

        # Convert the list of confidence dictionaries into a single prediction dictionary
        predictions = {item['label']: item['confidence'] for item in result['confidences']}

        if not predictions:
            return jsonify({"error": "Could not extract any predictions from the model response"}), 500

        # Sort and format the response exactly as the frontend expects
        sorted_preds = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
        top_pred = sorted_preds[0]
        all_preds_top5 = dict(sorted_preds[:5])

        formatted_result = {
            "predicted_class": top_pred[0],
            "confidence": float(top_pred[1]) * 100,
            "all_predictions": {k: float(v) * 100 for k, v in all_preds_top5.items()}
        }

        return jsonify(formatted_result)

    except Exception as e:
        # Catch any errors during the prediction process
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500
    finally:
        # IMPORTANT: Clean up the temporary file after we're done with it.
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)