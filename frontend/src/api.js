import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const processImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await axios.post(`${API_URL}/process-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export const processVideo = async (videoFile) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  try {
    const response = await axios.post(`${API_URL}/process-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};

export const setupWebcamStream = (onFrameReceived) => {
  const eventSource = new EventSource(`${API_URL}/webcam-feed`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onFrameReceived(data);
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
  };
  
  return () => {
    eventSource.close();
  };
};