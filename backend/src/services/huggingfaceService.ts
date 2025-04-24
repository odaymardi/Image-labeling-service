import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY!;

export async function detectObjects(base64Image: string) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
    { inputs: { image: base64Image } },
    {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data
    .filter((obj: any) => obj.score > 0.7)
    .map((obj: any) => obj.label);
}

export async function classifyScene(base64Image: string) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/microsoft/resnet-50',
    { inputs: { image: base64Image } },
    {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const sceneResults = response.data;
  return Array.isArray(sceneResults) && sceneResults.length > 0
    ? sceneResults[0].label
    : 'unknown';
}
