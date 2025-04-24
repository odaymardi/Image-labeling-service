// models/imageUploadModel.ts
import mongoose from 'mongoose';

const imageUploadSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // Same as file UUID
  },
  filename: {
    type: String,
    required: true, // Saved filename in `/uploads`
  },
  originalname: {
    type: String,
    required: true, // Original name from user
  },
  size: {
    type: Number,
    required: true, // Image size in bytes
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    required: true,
    default: 'uploading',
  },
  processingProgress: {
    type: Number,
    required: true,
    default: 0,
  },
  labels: {
    objects: [{ type: String }],
    scene: { type: String },
  },
  error: {
    type: String,
  },
});

export const ImageUploadModel = mongoose.model('ImageUpload', imageUploadSchema);
