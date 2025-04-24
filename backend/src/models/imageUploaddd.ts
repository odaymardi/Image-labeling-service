export interface ImageMetadata {
    id: string;
    filename: string;
    originalname: string;
    size: number;
    dimensions: {
      width: number;
      height: number;
    };
    uploadDate: Date;
  }
  
  export interface ImageLabels {
    objects: string[];
    scene: string;
  }
  
  export interface ImageUpload {
    id: string;
    metadata: ImageMetadata;
    labels?: ImageLabels;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    error?: string;
    processingProgress: number;
  }
  