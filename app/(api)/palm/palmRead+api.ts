
import axios from 'axios';
import Constants from 'expo-constants';
import { interpretPalmReading, PalmPrediction } from '../../../utils/palmInterpreter';

// Types
interface PalmReadingRequest {
  image: string;
}

interface PalmReadingResponse {
  data?: any;
  error?: string;
  status: number;
}

// Environment variables
const ROBOFLOW_API_KEY = Constants.expoConfig?.extra?.ROBOFLOW_API_KEY || process.env.ROBOFLOW_API_KEY;

/**
 * Validates if the provided string is a valid base64 image.
 * @param image - The image string to validate.
 * @returns True if valid, false otherwise.
 */
const isValidBase64Image = (image: string): boolean => {
  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
  return base64Regex.test(image);
};

/**
 * Processes the palm reading by sending the image to Roboflow API.
 * @param image - The base64 encoded image.
 * @returns The prediction result from Roboflow.
 */
const palmReadingFromRoboFlow = async (image: string): Promise<any> => {
  try {
    if (!ROBOFLOW_API_KEY) {
      throw new Error('Roboflow API key is not configured');
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const url = `https://serverless.roboflow.com/palm-reading-b3tep/1?api_key=${ROBOFLOW_API_KEY}`;

    console.log('Sending request to Roboflow API...');
    const res = await axios.post(url, base64Data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000, // 30 seconds timeout
    });

    console.log('Received response from Roboflow API');
    return res.data;
  } catch (error) {
    console.error('Error calling Roboflow API:', error);
    throw new Error('Failed to process palm reading');
  }
};

/**
 * Handles POST requests for palm reading.
 * @param request - The incoming request.
 * @returns A Response object with the result or error.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body: PalmReadingRequest = await request.json();
    const { image } = body;

    // Validate input
    if (!image) {
      return new Response(
        JSON.stringify({
          error: 'Image is required',
          status: 400,
        } as PalmReadingResponse),
        { status: 400 }
      );
    }

    if (!isValidBase64Image(image)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid image format. Must be a valid base64 encoded image.',
          status: 400,
        } as PalmReadingResponse),
        { status: 400 }
      );
    }

    // Process the palm reading
    const rawResult = await palmReadingFromRoboFlow(image);

    // Validate that we have predictions
    if (!rawResult.predictions || !Array.isArray(rawResult.predictions) || rawResult.predictions.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No palm detected in the image. Please ensure the palm is clearly visible.',
          status: 400,
        } as PalmReadingResponse),
        { status: 400 }
      );
    }

    // Interpret the palm reading using Vedic principles
    const interpretation = interpretPalmReading(rawResult.predictions[0] as PalmPrediction);

    return new Response(
      JSON.stringify({
        data: interpretation,
        status: 200,
      } as PalmReadingResponse),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in palm reading API:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        status: 500,
      } as PalmReadingResponse),
      { status: 500 }
    );
  }
}
