// tests/unit/imageService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractMetadata, processImage } from '../../src/services/imageService';
import { ImageUploadModel } from '../../src/models/imageUploadModel';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { detectObjects, classifyScene } from '../../src/services/huggingfaceService';

// Define mocks - these will be hoisted
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({
      width: 1920,
      height: 1080
    })
  }))
}));

vi.mock('fs', () => {
  const mockFs = {
    readFileSync: vi.fn(),
  };
  return {
    ...mockFs,
    default: mockFs,
  };
});

vi.mock('../../src/models/imageUploadModel.js', () => ({
  ImageUploadModel: {
    create: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

vi.mock('../../src/services/huggingfaceService.js', () => ({
  detectObjects: vi.fn(),
  classifyScene: vi.fn()
}));

describe('Image Service', () => {
  // Setup mock data for tests
  const mockImageBuffer = Buffer.from('mock-image-data');
  const mockBase64 = mockImageBuffer.toString('base64');
  
  beforeEach(() => {
    // Setup mocks before each test
    vi.clearAllMocks();
    
    // Set up return values inside beforeEach to avoid hoisting issues
    vi.mocked(fs.readFileSync).mockReturnValue(mockImageBuffer);
    vi.mocked(ImageUploadModel.create).mockImplementation((data) => Promise.resolve(data));
    vi.mocked(ImageUploadModel.findOneAndUpdate).mockResolvedValue({});
    vi.mocked(detectObjects).mockResolvedValue(['car', 'person', 'tree']);
    vi.mocked(classifyScene).mockResolvedValue('outdoor');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractMetadata', () => {
    const mockFile = {
      filename: 'test-image-123.jpg',
      originalname: 'original-name.jpg',
      path: '/uploads/test-image-123.jpg',
      size: 1024 * 1024 // 1MB
    } as Express.Multer.File;
    
    it('should extract metadata from an image and save to MongoDB', async () => {
      // Execute the function
      const result = await extractMetadata(mockFile);
      
      // Verify sharp was called with the file path
      expect(sharp).toHaveBeenCalledWith(mockFile.path);
      
      // Verify the DB creation was called with the correct data
      expect(ImageUploadModel.create).toHaveBeenCalledTimes(1);
      
      const expectedId = path.basename(mockFile.filename, path.extname(mockFile.filename));
      
      // Verify the returned object has the correct properties
      expect(result).toMatchObject({
        id: expectedId,
        filename: mockFile.filename,
        originalname: mockFile.originalname,
        size: mockFile.size,
        dimensions: {
          width: 1920,
          height: 1080
        },
        status: 'processing',
        processingProgress: 0
      });
      
      // Verify the upload date was set
      expect(result.uploadDate).toBeInstanceOf(Date);
    });
  });

  describe('processImage', () => {
    const mockId = 'test-image-123';
    const mockFilePath = '/uploads/test-image-123.jpg';
    
    it('should process an image and update MongoDB with results', async () => {
      // Execute the function
      await processImage(mockId, mockFilePath);
      
      // Verify file was read
      expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath);
      
      // Don't test exact base64 string, just verify the APIs were called
      expect(detectObjects).toHaveBeenCalled();
      expect(classifyScene).toHaveBeenCalled();
      
      // Make sure the same value was used for both API calls
      const detectObjectsCall = vi.mocked(detectObjects).mock.calls[0][0];
      const classifySceneCall = vi.mocked(classifyScene).mock.calls[0][0];
      expect(detectObjectsCall).toBe(classifySceneCall);
      
      // Verify MongoDB updates - should be called 4 times with different progress stages
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenCalledTimes(4);
      
      // Check first call - start processing
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        1,
        { id: mockId },
        {
          status: 'processing',
          processingProgress: 25
        }
      );
      
      // Check second call - after object detection
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        2,
        { id: mockId },
        {
          processingProgress: 50
        }
      );
      
      // Check third call - after scene classification
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        3,
        { id: mockId },
        {
          processingProgress: 75
        }
      );
      
      // Check final call - completed processing
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        4,
        { id: mockId },
        {
          labels: { objects: ['car', 'person', 'tree'], scene: 'outdoor' },
          status: 'completed',
          processingProgress: 100
        }
      );
    });

    it('should handle errors and update MongoDB with error status', async () => {
      // Setup error case
      const mockError = new Error('API failure');
      vi.mocked(detectObjects).mockRejectedValueOnce(mockError);
      
      // Execute the function
      await processImage(mockId, mockFilePath);
      
      // Verify file was read
      expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath);
      
      // Should have attempted the API call, but don't test exact base64 value
      expect(detectObjects).toHaveBeenCalled();
      
      // Should not have called the second API
      expect(classifyScene).not.toHaveBeenCalled();
      
      // Verify MongoDB updates - now only 2 calls: start processing and error update
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      
      // Check first call - start processing
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        1,
        { id: mockId },
        {
          status: 'processing',
          processingProgress: 25
        }
      );
      
      // Check error update
      expect(ImageUploadModel.findOneAndUpdate).toHaveBeenNthCalledWith(
        2,
        { id: mockId },
        {
          status: 'failed',
          processingProgress: 0,
          error: 'API failure'
        }
      );
    });
  });
});