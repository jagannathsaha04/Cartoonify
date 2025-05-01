# 🎨 Cartoonifier App

A full-stack AI-powered web application that cartoonifies images, videos, and live webcam streams using OpenCV, Flask, and React.

## 🌟 Features

- 🖼️ Upload an image and get a cartoon version
- 📹 Upload a video and convert it into a cartoonified version
- 📷 Use your webcam to view real-time cartoon effects
- ⚙️ Built with:
  - Python, Flask, OpenCV (Backend)
  - React, TailwindCSS, Axios (Frontend)
  - Flask-CORS for cross-origin requests

---

## 🚀 Live Demo

Soon

---

## 🛠️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cartoonify-project.git
cd cartoonify-project
```

---

### 2. Set Up the Conda Environment (Backend)

Make sure you have [Miniconda](https://docs.conda.io/en/latest/miniconda.html) installed.

```bash
conda create -n cartoonify python=3.10
conda activate cartoonify
conda install -c conda-forge opencv numpy flask
pip install flask-cors
```

Then run the backend server:

```bash
cd backend
python app.py
```

Your Flask server will run at `http://localhost:5000`

---

### 3. Set Up the React Frontend

```bash
cd ../frontend
npm install
npm start
```

The React app will start at `http://localhost:3000`

---

## 🧠 Architecture Overview

- `/backend/app.py`: Main Flask application exposing three endpoints:
  - `/process-image` – image cartoonification
  - `/process-video` – video cartoonification
  - `/webcam-feed` – real-time webcam streaming via SSE

- `/frontend/`: React app with modular components for each mode (Image, Video, Webcam)

- `tailwindcss` used for rapid styling and responsiveness

---

## 📦 Deployment

### Frontend (React)
Deployed using **Vercel** – optimized for static frontend hosting.

### Backend (Flask)
Deployed as a serverless function using Vercel's Python runtime.

Ensure API URLs in `frontend/src/api.js` point to your deployed backend URL.

---

## ⚠️ Troubleshooting

- **Webcam not working?**
  - Make sure your browser has permission.
  - Only works in secure (https) contexts.

- **CORS errors?**
  - Ensure Flask-CORS is properly installed and configured.




## 🙌 Acknowledgements

- Built with ❤️ by [Jagannath Saha](https://github.com/jagannathsaha-4)
- Powered by OpenCV, Flask, React, Tailwind CSS
