// tests/unit/huggingfaceService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectObjects, classifyScene } from '../../src/services/huggingfaceService';
import axios from 'axios';

// Mock axios
vi.mock('axios');
vi.mock('dotenv', () => ({
  config: vi.fn(),
  default: { config: vi.fn() } // Add default export
}));


// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  vi.resetModules();
  process.env = {
    ...originalEnv,
    HUGGINGFACE_API_KEY: 'test-api-key'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Hugging Face Service', () => {
  const mockBase64Image = 'base64-encoded-image-data';
  let detectObjects: typeof import('../../src/services/huggingfaceService').detectObjects;
  let classifyScene: typeof import('../../src/services/huggingfaceService').classifyScene;
  
  beforeEach(async() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      HUGGINGFACE_API_KEY: 'test-api-key'
    };
    
    // Dynamically import the service after setting env vars
    const huggingfaceService = await import('../../src/services/huggingfaceService');
    detectObjects = huggingfaceService.detectObjects;
    classifyScene = huggingfaceService.classifyScene;
    
    vi.clearAllMocks();
  });


  

  describe('detectObjects', () => {
    it('should detect objects in an image and return filtered labels', async () => {
      // Mock axios.post response for object detection
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: [
          { score: 0.9, label: 'car' },
          { score: 0.8, label: 'person' },
          { score: 0.6, label: 'bicycle' } // This should be filtered out (score < 0.7)
        ]
      });
      
      // Execute the function
      const result = await detectObjects(mockBase64Image);
      
      // Verify axios was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
        { inputs: { image: mockBase64Image } },
        {
          headers: {
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Verify results are filtered correctly (only objects with score > 0.7)
      expect(result).toEqual(['car', 'person']);
      expect(result).not.toContain('bicycle');
    });
    
    it('should handle empty response from API', async () => {
      // Mock axios.post response with empty array
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: []
      });
      
      // Execute the function
      const result = await detectObjects(mockBase64Image);
      
      // Verify empty array is returned
      expect(result).toEqual([]);
    });
    
    it('should handle API errors', async () => {
      // Mock axios.post to throw an error
      const mockError = new Error('API error');
      vi.mocked(axios.post).mockRejectedValueOnce(mockError);
      
      // Execute and expect the error to be thrown
      await expect(detectObjects(mockBase64Image)).rejects.toThrow('API error');
    });
  });

  describe('classifyScene', () => {
    it('should classify scene and return the top label', async () => {
      // Mock axios.post response for scene classification
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: [
          { score: 0.8, label: 'outdoor' },
          { score: 0.15, label: 'landscape' }
        ]
      });
      
      // Execute the function
      const result = await classifyScene(mockBase64Image);
      
      // Verify axios was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        'https://api-inference.huggingface.co/models/microsoft/resnet-50',
        { inputs: { image: mockBase64Image } },
        {
          headers: {
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Verify result is the top label
      expect(result).toBe('outdoor');
    });
    
    it('should return "unknown" for empty response', async () => {
      // Mock axios.post response with empty array
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: []
      });
      
      // Execute the function
      const result = await classifyScene(mockBase64Image);
      
      // Verify "unknown" is returned for empty response
      expect(result).toBe('unknown');
    });
    
    it('should handle API errors', async () => {
      // Mock axios.post to throw an error
      const mockError = new Error('API error');
      vi.mocked(axios.post).mockRejectedValueOnce(mockError);
      
      // Execute and expect the error to be thrown
      await expect(classifyScene(mockBase64Image)).rejects.toThrow('API error');
    });
  });
});
