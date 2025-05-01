import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Repeat, ArrowLeft, FileVideo } from 'lucide-react';
import { processImage, processVideo, setupWebcamStream } from './api';

const LoadingScreen = ({ message = "Loading Cartoonify" }) => (
  <div className="fixed inset-0 bg-blue-900 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
      <p className="text-blue-200">Preparing your cartoon experience...</p>
    </div>
  </div>
);

const StartScreen = ({ onSelect }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">Cartoonify</h1>
      <p className="text-gray-600 mb-8 text-center">Transform your images and videos into cartoon style</p>
      
      <div className="space-y-4">
        <button 
          onClick={() => onSelect('webcam')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all"
        >
          <Camera size={20} />
          <span>Live Webcam</span>
        </button>
        
        <button 
          onClick={() => onSelect('image')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all"
        >
          <Upload size={20} />
          <span>Upload Photo</span>
        </button>
        
        {
        
        // Uploading video feature to be done later

        /* <button 
          onClick={() => onSelect('video')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all"
        >
          <FileVideo size={20} />
          <span>Upload Video</span>
        </button> */}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Transform your world into cartoon art!</p>
      </div>
    </div>
  </div>
);

const WebcamMode = ({ onBack }) => {
  const [isCartoon, setIsCartoon] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [frameData, setFrameData] = useState(null);
  
  useEffect(() => {
    // Set up connection to backend webcam stream
    const cleanup = setupWebcamStream((data) => {
      if (data.error) {
        console.error("Webcam error:", data.error);
        return;
      }
      setFrameData(data);
      setIsLoading(false);
    });
    
    // Set up escape key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      cleanup();
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onBack]);
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {isLoading && <LoadingScreen message="Connecting to webcam" />}
      
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="text-white flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <h2 className="text-white text-xl font-medium">Live Webcam Cartoonify</h2>
        
        <button 
          onClick={() => setIsCartoon(!isCartoon)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
        >
          <Repeat size={16} />
          <span>{isCartoon ? "Show Original" : "Show Cartoon"}</span>
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative bg-black rounded-lg overflow-hidden shadow-xl max-w-4xl w-full aspect-video">
          {frameData && (
            <img 
              src={`data:image/jpeg;base64,${isCartoon ? frameData.cartoon : frameData.original}`}
              alt={isCartoon ? "Cartoonified webcam" : "Original webcam"}
              className="w-full h-full object-contain"
            />
          )}
          {!frameData && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-center px-4">
                Webcam stream unavailable
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 text-center text-gray-400 text-sm">
        Press ESC key or click Back to return to the main menu
      </div>
    </div>
  );
};

const ImageMode = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCartoon, setIsCartoon] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    // Set up escape key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onBack]);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
      await processImageFile(file);
    }
  };
  
  const processImageFile = async (file) => {
    setIsProcessing(true);
    
    try {
      const result = await processImage(file);
      setProcessedData(result);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {isProcessing && <LoadingScreen message="Processing image" />}
      
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="text-white flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <h2 className="text-white text-xl font-medium">Image Cartoonify</h2>
        
        {processedData && (
          <button 
            onClick={() => setIsCartoon(!isCartoon)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <Repeat size={16} />
            <span>{isCartoon ? "Show Original" : "Show Cartoon"}</span>
          </button>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        {!selectedFile ? (
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center max-w-xl w-full">
            <Upload size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Upload an Image</h3>
            <p className="text-gray-400 mb-6">Select a JPG or PNG file to cartoonify</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="hidden"
            />
            
            <button
              onClick={triggerFileInput}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition-all"
            >
              Select Image
            </button>
          </div>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden shadow-xl max-w-4xl w-full">
            {processedData && (
              <img 
                src={`data:image/jpeg;base64,${isCartoon ? processedData.cartoon : processedData.original}`}
                alt={isCartoon ? "Cartoonified image" : "Original image"} 
                className="w-full h-auto"
              />
            )}
            <div className="absolute top-4 right-4">
              <button
                onClick={triggerFileInput}
                className="bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white p-2 rounded-full transition-all"
              >
                <Upload size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 p-4 text-center text-gray-400 text-sm">
        Upload an image to apply the cartoonify effect
      </div>
    </div>
  );
};

const VideoMode = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCartoon, setIsCartoon] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    // Set up escape key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onBack]);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      await processVideoFile(file);
    }
  };
  
  const processVideoFile = async (file) => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress updates (in a real app, you'd get these from the backend)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);
    
    try {
      const result = await processVideo(file);
      setProcessedData(result);
      setProgress(100);
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {isProcessing && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center max-w-md w-full px-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Video</h2>
            <p className="text-blue-200 mb-4">This may take several minutes depending on video length</p>
            
            <div className="w-full bg-blue-800 rounded-full h-4 mb-2">
              <div 
                className="bg-blue-500 h-4 rounded-full transition-all duration-300" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <p className="text-blue-200">{progress}% complete</p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="text-white flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <h2 className="text-white text-xl font-medium">Video Cartoonify</h2>
        
        {processedData && (
          <button 
            onClick={() => setIsCartoon(!isCartoon)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <Repeat size={16} />
            <span>{isCartoon ? "Show Original" : "Show Cartoon"}</span>
          </button>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        {!selectedFile ? (
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center max-w-xl w-full">
            <FileVideo size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Upload a Video</h3>
            <p className="text-gray-400 mb-6">Select an MP4 or MOV file to cartoonify</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            
            <button
              onClick={triggerFileInput}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-all"
            >
              Select Video
            </button>
          </div>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden shadow-xl max-w-4xl w-full">
            {/* This is where the video would be displayed */}
            {/* In a real implementation, you would need to handle video display differently */}
            {processedData ? (
              <div className="w-full aspect-video bg-black flex items-center justify-center">
                <p className="text-white">
                  {isCartoon ? "Cartoonified video ready" : "Original video ready"}
                  <br />
                  <span className="text-gray-400 text-sm">(Video playback would be implemented here)</span>
                </p>
              </div>
            ) : (
              <video 
                src={URL.createObjectURL(selectedFile)}
                controls
                className="w-full h-auto"
              />
            )}
            <div className="absolute top-4 right-4">
              <button
                onClick={triggerFileInput}
                className="bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white p-2 rounded-full transition-all"
              >
                <Upload size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 p-4 text-center text-gray-400 text-sm">
        Note: Video processing is resource-intensive and may take several minutes
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState(null);

  useEffect(() => {
    // Simulate initial loading (gives time for resources to load)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setCurrentMode(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentMode) {
    return <StartScreen onSelect={setCurrentMode} />;
  }

  switch (currentMode) {
    case 'webcam':
      return <WebcamMode onBack={handleBack} />;
    case 'image':
      return <ImageMode onBack={handleBack} />;
    case 'video':
      return <VideoMode onBack={handleBack} />;
    default:
      return <StartScreen onSelect={setCurrentMode} />;
  }
}

export default App;