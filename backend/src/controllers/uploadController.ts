// src/controllers/uploadController.ts

import { Request, Response } from 'express';
import { extractMetadata, processImage } from '../services/imageService.js';
import { ImageUploadModel } from '../models/imageUploadModel.js';

export async function uploadImages(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      const imageUpload = await extractMetadata(file);

      // Save the metadata to MongoDB
      const saved = await ImageUploadModel.create(imageUpload);
      uploadResults.push(saved.toObject());

      // Begin async processing
      processImage(saved.id, file.path).catch(async (error) => {
        console.error(`Error processing image ${saved.id}:`, error);

        await ImageUploadModel.updateOne(
          { id: saved.id },
          {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            processingProgress: 0,
          }
        );
      });
    }

    res.status(201).json({ uploads: uploadResults });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
}
