from flask import Flask, request, jsonify
from flask_cors import CORS
from steganography import LSBSteg
import cv2
import numpy as np
import tempfile
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'image'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/encode', methods=['POST'])
def encode():
    # Check if a valid file and data were sent
    if 'file' not in request.files or 'data' not in request.form:
        return jsonify({'error': 'File or data not provided'}), 400

    file = request.files['file']
    data = request.form['data'] 

    # Check if file has allowed extension
    if file and allowed_file(file.filename):
        # Save the uploaded image
        filename = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filename)

        # Read the image using OpenCV
        image = cv2.imread(filename)

        # Encode data into the image
        steg = LSBSteg(image)
        img = steg.encode_text(data)

        # Save the steganography image
        stego_filename = os.path.join(UPLOAD_FOLDER, 'stego_' + file.filename)
        cv2.imwrite(stego_filename, img)

        return jsonify({'stego_image': stego_filename}), 200
    else:
        return jsonify({'error': 'Invalid file or file extension not allowed'}), 400

@app.route('/decode', methods=['POST'])
def decode():
    # Check if a valid file was sent
    if 'file' not in request.files:
        return jsonify({'error': 'File not provided'}), 400

    file = request.files['file']

    # Check if file has allowed extension
    if file and allowed_file(file.filename):
        # Save the uploaded image
        filename = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filename)

        # Read the image using OpenCV
        image = cv2.imread(filename)

        # Decode text from the image
        steg = LSBSteg(image)
        hidden_data = steg.decode_text()

        return jsonify({'hidden_data': hidden_data}), 200
    else:
        return jsonify({'error': 'Invalid file or file extension not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True)
