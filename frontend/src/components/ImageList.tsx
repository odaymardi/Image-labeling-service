import React from 'react';
import ImageItem from './ImageItem';
import { ImageUpload } from '../types';

interface ImageListProps {
  uploads: ImageUpload[];
}

const ImageList: React.FC<ImageListProps> = ({ uploads }) => {
  if (!uploads.length) {
    return <div className="no-images">No images uploaded yet</div>;
  }

  // Calculate overall progress
  const total = uploads.length;
  const processed = uploads.filter(
    u => u.status === 'completed' || u.status === 'failed'
  ).length;
  const overallProgress = total ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="image-list">
      <h2>Uploaded Images ({uploads.length})</h2>

      {/* Overall Progress */}
      {processed < total && (
        <div className="overall-progress mb-4">
          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="bg-green-500 h-3 rounded transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1 text-gray-600">
            Overall Progress: {overallProgress}%
          </p>
        </div>
      )}

      {/* Image Items */}
      <div className="image-grid">
        {uploads.map(upload => (
          <ImageItem key={upload.id} upload={upload} />
        ))}
      </div>
    </div>
  );
};

export default ImageList;
