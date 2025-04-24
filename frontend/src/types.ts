export interface ImageUpload {
  id: string;
  filename: string;
  originalname: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  uploadDate: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  processingProgress: number;
  labels?: {
    objects: string[];
    scene: string;
  };
  error?: string;
}
