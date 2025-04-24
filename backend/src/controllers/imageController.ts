// src/controllers/imageController.ts

import { Request, Response } from 'express';
import { ImageUploadModel } from '../models/imageUploadModel.js';

export async function getAllImages(_req: Request, res: Response) {
  try {
    const images = await ImageUploadModel.find().lean();
    res.json({ images });
  } catch (error) {
    console.error('Error fetching all images:', error);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
}

export async function getImageById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const image = await ImageUploadModel.findOne({ id }).lean();

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ image });
  } catch (error) {
    console.error(`Error fetching image with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
}
