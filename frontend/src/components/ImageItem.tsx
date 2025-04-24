import React from 'react';
import { ImageUpload } from '../types';

interface ImageItemProps {
  upload: ImageUpload;
}

const ImageItem: React.FC<ImageItemProps> = ({ upload }) => {
  const {
    filename,
    originalname,
    size,
    dimensions,
    status,
    labels,
    processingProgress,
    error,
  } = upload;

  const imageUrl = `${process.env.REACT_APP_API_URL}/uploads/${filename}`;
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="image-item">
      <div className="image-preview">
        <img src={imageUrl} alt={originalname} />
      </div>

      <div className="image-info">
        <h3>{originalname}</h3>

        <div className="metadata">
          <p><strong>Size:</strong> {formatFileSize(size)}</p>
          <p><strong>Dimensions:</strong> {dimensions.width} x {dimensions.height}px</p>
          <p><strong>Status:</strong> {status}</p>
        </div>

        {status === 'processing' && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${processingProgress}%` }}
            />
            <span>{processingProgress}%</span>
          </div>
        )}

        {status === 'completed' && labels && (
          <div className="labels">
            <div className="label-group">
              <h4>Objects:</h4>
              <div className="tags">
                {labels.objects.length > 0 ? (
                  labels.objects.map((obj, idx) => (
                    <span key={idx} className="tag">{obj}</span>
                  ))
                ) : (
                  <span>No objects detected</span>
                )}
              </div>
            </div>

            <div className="label-group">
              <h4>Scene Type:</h4>
              <div className="tags">
                <span className="tag scene">{labels.scene}</span>
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="error-message">
            Failed to process image: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageItem;
