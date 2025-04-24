// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageList from './components/ImageList';
import { ImageUpload } from './types';
import './App.css';

// Use the environment variable for the API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/';  // Fallback to localhost if variable is not set

function App() {
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/images`);
      const data = await response.json();
      setUploads(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchImages();
    
    // Poll for updates every 3 seconds
    const intervalId = setInterval(fetchImages, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;

    setIsLoading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploads(prev => [...prev, ...result.uploads]);
      fetchImages(); // Refresh the list
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Image Upload & Labeling Service</h1>
      </header>
      <main>
        <ImageUploader onUpload={handleUpload} isLoading={isLoading} />
        <ImageList uploads={uploads} />
      </main>
    </div>
  );
}

export default App;
