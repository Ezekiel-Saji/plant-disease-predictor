from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client, file
import os
import re
import uuid # To create unique filenames
import json # Add this line
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv() 
app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    #using the official Gradio Python client.
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
@app.route("/get-disease-info", methods=["POST"])
def get_disease_info():
    # Configure the Google Gemini API key
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    print("is called")
    # Create a Generative Model instance
    model = genai.GenerativeModel('gemini-1.5-flash')
    data = request.json
    disease_name = data.get("disease_name")
    print("is called")
    if not disease_name:
        return jsonify({"error": "No disease name provided"}), 400

    prompt = f"""
    You are a plant disease expert. Provide a concise response about '{disease_name}'.
    Format the information as a JSON object with the following keys:
    'description' (string): A short description of the disease.
    'causes' (list of strings): A list of the main causes of the disease.
    'symptoms' (list of strings): A list of key symptoms.
    'treatment' (list of strings): A list of treatment or management methods.
    Do not include any extra text outside the JSON object.
    """

    try:
        response = model.generate_content(prompt)
        gemini_response_text = response.text
        
        # Use a regular expression to find the JSON object within the text
        # The `re.DOTALL` flag allows the `.` to match newlines
        match = re.search(r'\{.*\}', gemini_response_text, re.DOTALL)
        
        if not match:
            # If no JSON object is found, it's an error
            print(f"Gemini did not return a valid JSON object. Response: {gemini_response_text}")
            return jsonify({"error": "Gemini response did not contain the expected JSON format."}), 500

        # Extract the matched JSON string
        json_string = match.group(0)

        # Parse the extracted JSON string
        disease_info = json.loads(json_string)
        return jsonify(disease_info)

    except json.JSONDecodeError as e:
        # Catch a specific error for better debugging
        print(f"JSON parsing failed: {e}")
        print(f"Attempted to parse: {json_string}") # This helps debug the bad string
        return jsonify({"error": "Failed to parse Gemini response as JSON."}), 500
    except Exception as e:
        # A general catch-all for other unexpected errors
        print(f"Error calling Gemini API: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)