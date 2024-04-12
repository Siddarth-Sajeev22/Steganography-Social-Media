from flask import Flask, request, jsonify
from flask_cors import CORS
from steganography import LSBSteg
import cv2
import numpy as np
import tempfile
import os
from cryptography.fernet import Fernet

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'public/assets'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/encode', methods=['POST'])
def encode_message():
    # Check if a valid file and data were sent
    if 'file' not in request.files or 'data' not in request.form:
        return jsonify({'error': 'File or data not provided'}), 400

    file = request.files['file']
    data = request.form['data'] 

    # Generate a new key for encryption
    key = Fernet.generate_key()
    cipher = Fernet(key)

    # Encrypt the data using the generated key
    encrypted_data = cipher.encrypt(data.encode())

    # Check if file has allowed extension
    if file and allowed_file(file.filename):
        # Save the uploaded image
        lossy_formats = ["jpeg", "jpg"]
        filen, ext = file.filename.rsplit(".", 1) 
        newfile =  filen + ".png"

        filename = os.path.join(UPLOAD_FOLDER, newfile)
        file.save(filename)

        # Read the image using OpenCV
        image = cv2.imread(filename)

        # Encode data into the image
        steg = LSBSteg(image)
        img = steg.encode_text(encrypted_data)

        # Save the steganography image
        stego_filename = os.path.join(UPLOAD_FOLDER, newfile)
        cv2.imwrite(stego_filename, img)

        return jsonify({'stego_image': newfile, 'access_key': key.decode()}), 200
    else:
        return jsonify({'error': 'Invalid file or file extension not allowed'}), 400

@app.route('/decode', methods=['POST'])
def decode_message():
    # Check if a valid file and access key were sent
    if 'file' not in request.files or 'accessKey' not in request.form:
        return jsonify({'error': 'File or access key not provided'}), 400

    file = request.files['file']
    access_key = request.form['accessKey']

    # Check if file has allowed extension
    if file and allowed_file(file.filename):
        # Save the uploaded image
        filename = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filename)

        # Read the image using OpenCV
        image = cv2.imread(filename)

        # Decode text from the image
        steg = LSBSteg(image)
        encrypted_data = steg.decode_text()

        # # Decrypt the data using the provided access key
        cipher = Fernet(access_key.encode())
        decrypted_data = cipher.decrypt(encrypted_data.encode()).decode()

        return jsonify({'hidden_data': decrypted_data}), 200
    else:
        return jsonify({'error': 'Invalid file or file extension not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True)
