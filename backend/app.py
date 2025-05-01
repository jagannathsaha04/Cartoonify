from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import numpy as np
import base64
import time
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Cartoonify function
def cartoonify(img):
    # Convert to grayscale for edge detection
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Apply bilateral filter for smoothing
    img_smooth = cv2.bilateralFilter(img, d=9, sigmaColor=30, sigmaSpace=7)
    # Edge detection using Canny
    edges = cv2.Canny(img_gray, 100, 200)
    # Bitwise NOT for edge overlay
    edges_final = cv2.bitwise_not(edges)
    # Color Quantization: Reduce color precision
    img_smooth = (img_smooth // 32) * 32
    # Combine smoothed image and edges
    img_cartoon = cv2.bitwise_and(img_smooth, img_smooth, mask=edges_final)
    return img_cartoon

# For webcam stream
@app.route('/webcam-feed')
def webcam_feed():
    def generate_frames():
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            yield f"data: {json.dumps({'error': 'Could not open webcam'})}\n\n"
            return
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                    
                # Apply cartoonify effect
                cartoon_frame = cartoonify(frame)
                
                # Encode frames as JPEG
                _, buffer_original = cv2.imencode('.jpg', frame)
                _, buffer_cartoon = cv2.imencode('.jpg', cartoon_frame)
                
                # Convert to base64 strings
                original_b64 = base64.b64encode(buffer_original).decode('utf-8')
                cartoon_b64 = base64.b64encode(buffer_cartoon).decode('utf-8')
                
                data = {
                    'original': original_b64,
                    'cartoon': cartoon_b64
                }
                
                yield f"data: {json.dumps(data)}\n\n"
                time.sleep(0.1)  # Control frame rate
        except Exception as e:
            print(f"Error in webcam stream: {e}")
        finally:
            cap.release()
    
    return Response(generate_frames(), mimetype='text/event-stream')

# For uploaded images
@app.route('/process-image', methods=['POST'])
def process_image():
    # Get the uploaded image file
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    
    # Read and process the image
    img_data = file.read()
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Apply cartoonify effect
    cartoon_img = cartoonify(img)
    
    # Convert back to base64 for sending to frontend
    _, img_encoded = cv2.imencode('.jpg', img)
    _, cartoon_encoded = cv2.imencode('.jpg', cartoon_img)
    
    original_b64 = base64.b64encode(img_encoded).decode('utf-8')
    cartoon_b64 = base64.b64encode(cartoon_encoded).decode('utf-8')
    
    return jsonify({
        'original': original_b64,
        'cartoon': cartoon_b64
    })

# For uploaded videos
@app.route('/process-video', methods=['POST'])
def process_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video provided'}), 400
    
    file = request.files['video']
    temp_path = 'temp_video.mp4'
    file.save(temp_path)
    
    # Process the video
    cap = cv2.VideoCapture(temp_path)
    if not cap.isOpened():
        return jsonify({'error': 'Could not open video file'}), 400
    
    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    # Create output video writer
    output_path = 'temp_cartoon.mp4'
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    frame_count = 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        cartoon_frame = cartoonify(frame)
        out.write(cartoon_frame)
        
        frame_count += 1
        if frame_count % 10 == 0:
            print(f"Processed {frame_count}/{total_frames} frames")
    
    cap.release()
    out.release()
    
    # In a real app, you'd return a download link or stream the video
    # For this example, we'll just return success
    return jsonify({
        'message': 'Video processed successfully',
        'progress': 100
    })

# Simple index route
@app.route('/')
def index():
    return "Cartoonify API is running!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)