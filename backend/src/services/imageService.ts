import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ImageUploadModel } from '../models/imageUploadModel.js';
import { detectObjects, classifyScene } from './huggingfaceService.js';

/**
 * Extracts image dimensions and metadata, saves to MongoDB
 */
export async function extractMetadata(file: Express.Multer.File) {
  const id = path.basename(file.filename, path.extname(file.filename));

  const dimensions = await sharp(file.path).metadata().then(metadata => ({
    width: metadata.width || 0,
    height: metadata.height || 0,
  }));

  const imageUpload = await ImageUploadModel.create({
    id,
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    dimensions,
    uploadDate: new Date(),
    status: 'processing',
    processingProgress: 0,
  });

  return imageUpload;
}

/**
 * Processes the image using Hugging Face APIs and updates MongoDB
 */
export async function processImage(id: string, filePath: string): Promise<void> {
  try {
    await ImageUploadModel.findOneAndUpdate({ id }, {
      status: 'processing',
      processingProgress: 25,
    });

    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    const objects = await detectObjects(base64Image);
    await ImageUploadModel.findOneAndUpdate({ id }, {
      processingProgress: 50,
    });

    const scene = await classifyScene(base64Image);
    await ImageUploadModel.findOneAndUpdate({ id }, {
      processingProgress: 75,
    });

    await ImageUploadModel.findOneAndUpdate({ id }, {
      labels: { objects: objects || [], scene },
      status: 'completed',
      processingProgress: 100,
    });
  } catch (error) {
    console.error(`Error processing image ${id}:`, error);
    await ImageUploadModel.findOneAndUpdate({ id }, {
      status: 'failed',
      processingProgress: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
