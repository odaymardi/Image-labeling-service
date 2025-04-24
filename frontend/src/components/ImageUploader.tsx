import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div 
      className={`uploader ${dragActive ? 'active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="file-upload" 
        multiple
        accept="image/*" 
        onChange={handleChange}
        disabled={isLoading}
        ref={inputRef}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload" className="upload-label">
        <div>
          <p>Drag and drop your images here, or</p>
          <button 
            type="button" 
            className="upload-button"
            onClick={onButtonClick}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Select Files'}
          </button>
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;