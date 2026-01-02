import * as faceapi from 'face-api.js';
import { adminApi } from './api';
import { attendanceLocationService, EmployeeFaceImage } from './attendanceLocationService';

// Face recognition using face-api.js (TensorFlow.js based ML library)
// Supports multi-angle face capture and recognition

let modelsLoaded = false;
let isLoadingModels = false;

export type FaceAngle = 'front' | 'left' | 'right' | 'up' | 'down';

/**
 * Load face-api.js models
 * Models need to be placed in public/models directory
 */
async function loadModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  if (isLoadingModels) {
    // Wait for ongoing load
    while (isLoadingModels) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return modelsLoaded;
  }

  try {
    isLoadingModels = true;
    
    // Try loading from local /models directory first, fallback to CDN
    const LOCAL_MODEL_URL = '/models';
    const CDN_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    // Try local first
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_MODEL_URL)
      ]);
      modelsLoaded = true;
      isLoadingModels = false;
      return true;
    } catch (localError) {
      console.warn('Local models not found, trying CDN...', localError);
      
      // Fallback to CDN
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(CDN_MODEL_URL)
      ]);
      
      modelsLoaded = true;
      isLoadingModels = false;
      console.log('Face-api.js models loaded from CDN');
      return true;
    }
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    isLoadingModels = false;
    return false;
  }
}

/**
 * Detect face in image using face-api.js
 */
async function detectFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>> | null> {
  try {
    await loadModels();
    
    if (!modelsLoaded) {
      console.warn('Face-api.js models not loaded, using fallback detection');
      return null;
    }

    // Detect face with landmarks and descriptor
    const detection = await faceapi
      .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection || null;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
}

/**
 * Capture face from video stream with face detection
 * Returns base64 encoded image and face descriptor
 */
export async function captureFaceFromVideo(
  videoElement: HTMLVideoElement
): Promise<{ imageData: string; descriptor: Float32Array | null; detected: boolean } | null> {
  try {
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      throw new Error('Video not ready');
    }

    // Detect face first
    const detection = await detectFace(videoElement);
    
    if (!detection || !detection.detection) {
      return { imageData: '', descriptor: null, detected: false };
    }

    // Create canvas and draw video frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Draw face detection box (optional, for debugging)
    // const box = detection.detection.box;
    // ctx.strokeStyle = '#00ff00';
    // ctx.lineWidth = 2;
    // ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Get face descriptor
    const descriptor = detection.descriptor;

    return {
      imageData,
      descriptor,
      detected: true
    };
  } catch (error) {
    console.error('Error capturing face:', error);
    return null;
  }
}

/**
 * Get face descriptor from image using face-api.js
 */
export async function getFaceDescriptor(imageData: string): Promise<Float32Array | null> {
  try {
    await loadModels();
    
    if (!modelsLoaded) {
      console.warn('Face-api.js models not loaded');
      return null;
    }

    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const detection = await detectFace(img);
          if (detection && detection.descriptor) {
            resolve(detection.descriptor);
          } else {
            reject(new Error('No face detected in image'));
          }
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData;
    });
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
}

/**
 * Compare two face descriptors using Euclidean distance
 * Returns confidence score (0-100)
 */
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  // Calculate Euclidean distance between descriptors
  let distance = 0;
  for (let i = 0; i < descriptor1.length && i < descriptor2.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    distance += diff * diff;
  }
  distance = Math.sqrt(distance);

  // face-api.js typical threshold: < 0.6 = match
  // Convert distance to confidence score (0-100)
  // Lower distance = higher confidence
  const threshold = 0.6;
  const confidence = Math.max(0, Math.min(100, (1 - distance / threshold) * 100));
  
  return confidence;
}

export const faceRecognitionService = {
  /**
   * Get all face images for an employee (including all angles)
   */
  async getAllFaceImages(employeeId: string): Promise<EmployeeFaceImage[]> {
    try {
      const response = await adminApi.get<EmployeeFaceImage[]>(
        `/employee_face_images?employee_id=eq.${employeeId}&order=captured_at.desc`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching face images:', error);
      return [];
    }
  },

  /**
   * Get primary face image for an employee
   */
  async getPrimaryFaceImage(employeeId: string): Promise<EmployeeFaceImage | null> {
    try {
      const response = await adminApi.get<EmployeeFaceImage[]>(
        `/employee_face_images?employee_id=eq.${employeeId}&is_primary=eq.true&limit=1`
      );
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error fetching face image:', error);
      return null;
    }
  },

  /**
   * Get face images by angle
   */
  async getFaceImagesByAngle(employeeId: string, angle: FaceAngle): Promise<EmployeeFaceImage[]> {
    try {
      const response = await adminApi.get<EmployeeFaceImage[]>(
        `/employee_face_images?employee_id=eq.${employeeId}&capture_angle=eq.${angle}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching face images by angle:', error);
      return [];
    }
  },

  /**
   * Save face image for an employee with angle information
   */
  async saveFaceImage(
    employeeId: string,
    imageData: string,
    faceEncoding?: string,
    angle: FaceAngle = 'front',
    isPrimary: boolean = false
  ): Promise<EmployeeFaceImage> {
    try {
      // If this is primary, unset other primary images
      if (isPrimary) {
        try {
          await adminApi.patch(
            `/employee_face_images?employee_id=eq.${employeeId}`,
            { is_primary: false }
          );
        } catch (error) {
          console.warn('Could not unset other primary images:', error);
        }
      }

      const response = await adminApi.post<EmployeeFaceImage>(
        '/employee_face_images',
        {
          employee_id: employeeId,
          face_image_url: imageData, // In production, upload to Supabase Storage
          face_encoding: faceEncoding || null,
          capture_angle: angle,
          is_primary: isPrimary,
          captured_at: new Date().toISOString(),
          captured_via: 'web',
          device_info: navigator.userAgent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving face image:', error);
      throw error;
    }
  },

  /**
   * Save multiple face images (multi-angle capture)
   */
  async saveMultipleFaceImages(
    employeeId: string,
    captures: Array<{ imageData: string; descriptor: Float32Array; angle: FaceAngle }>
  ): Promise<EmployeeFaceImage[]> {
    try {
      // Unset all existing primary images
      try {
        await adminApi.patch(
          `/employee_face_images?employee_id=eq.${employeeId}`,
          { is_primary: false }
        );
      } catch (error) {
        console.warn('Could not unset other primary images:', error);
      }

      const savedImages: EmployeeFaceImage[] = [];
      
      for (let i = 0; i < captures.length; i++) {
        const capture = captures[i];
        const encoding = JSON.stringify(Array.from(capture.descriptor));
        const isPrimary = i === 0; // First capture (front) is primary
        
        const response = await adminApi.post<EmployeeFaceImage>(
          '/employee_face_images',
          {
            employee_id: employeeId,
            face_image_url: capture.imageData,
            face_encoding: encoding,
            capture_angle: capture.angle,
            is_primary: isPrimary,
            captured_at: new Date().toISOString(),
            captured_via: 'web',
            device_info: navigator.userAgent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        savedImages.push(response.data);
      }

      return savedImages;
    } catch (error) {
      console.error('Error saving multiple face images:', error);
      throw error;
    }
  },

  /**
   * Verify face against stored face images (checks all angles)
   */
  async verifyFace(
    employeeId: string,
    capturedImageData: string
  ): Promise<{ verified: boolean; confidence: number; matchedAngle?: FaceAngle }> {
    try {
      // Get all stored face images
      const storedFaces = await this.getAllFaceImages(employeeId);
      
      if (storedFaces.length === 0) {
        return { verified: false, confidence: 0 };
      }

      // Get descriptor for captured image
      const capturedDescriptor = await getFaceDescriptor(capturedImageData);
      if (!capturedDescriptor) {
        return { verified: false, confidence: 0 };
      }

      // Compare with all stored faces and get the best match
      let bestConfidence = 0;
      let matchedAngle: FaceAngle | undefined;

      for (const storedFace of storedFaces) {
        if (!storedFace.face_encoding) continue;

        try {
          const storedDescriptor = new Float32Array(JSON.parse(storedFace.face_encoding));
          const confidence = compareFaces(capturedDescriptor, storedDescriptor);
          
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            matchedAngle = (storedFace as any).capture_angle || 'front';
          }
        } catch (error) {
          console.error('Error parsing stored face encoding:', error);
        }
      }

      // If no encoding available, try comparing with image URLs
      if (bestConfidence === 0) {
        for (const storedFace of storedFaces) {
          if (!storedFace.face_image_url) continue;
          
          try {
            const storedDescriptor = await getFaceDescriptor(storedFace.face_image_url);
            if (!storedDescriptor) continue;

            const confidence = compareFaces(capturedDescriptor, storedDescriptor);
            if (confidence > bestConfidence) {
              bestConfidence = confidence;
              matchedAngle = (storedFace as any).capture_angle || 'front';
            }
          } catch (error) {
            console.error('Error comparing with stored image:', error);
          }
        }
      }

      return {
        verified: bestConfidence >= 70, // 70% confidence threshold
        confidence: bestConfidence,
        matchedAngle
      };
    } catch (error) {
      console.error('Error verifying face:', error);
      return { verified: false, confidence: 0 };
    }
  },

  /**
   * Capture and save face image (single angle - for backward compatibility)
   */
  async captureAndSaveFace(
    employeeId: string,
    videoElement: HTMLVideoElement,
    angle: FaceAngle = 'front'
  ): Promise<{ success: boolean; imageData?: string; error?: string }> {
    try {
      const result = await captureFaceFromVideo(videoElement);
      
      if (!result || !result.detected) {
        return { success: false, error: 'No face detected. Please ensure your face is clearly visible in the frame.' };
      }

      if (!result.descriptor) {
        return { success: false, error: 'Failed to extract face features' };
      }

      const encoding = JSON.stringify(Array.from(result.descriptor));
      const isPrimary = angle === 'front';

      // Save face image
      await this.saveFaceImage(employeeId, result.imageData, encoding, angle, isPrimary);

      return { success: true, imageData: result.imageData };
    } catch (error: any) {
      console.error('Error capturing and saving face:', error);
      return { success: false, error: error.message || 'Failed to capture face' };
    }
  },

  /**
   * Capture multiple angles of face (for first-time registration)
   */
  async captureMultipleAngles(
    employeeId: string,
    videoElement: HTMLVideoElement,
    angles: FaceAngle[]
  ): Promise<{ success: boolean; captures?: Array<{ imageData: string; descriptor: Float32Array; angle: FaceAngle }>; error?: string }> {
    try {
      const captures: Array<{ imageData: string; descriptor: Float32Array; angle: FaceAngle }> = [];

      for (const angle of angles) {
        const result = await captureFaceFromVideo(videoElement);
        
        if (!result || !result.detected || !result.descriptor) {
          return { 
            success: false, 
            error: `Failed to capture ${angle} angle. Please ensure your face is clearly visible.` 
          };
        }

        captures.push({
          imageData: result.imageData,
          descriptor: result.descriptor,
          angle
        });

        // Small delay between captures
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Save all captures
      await this.saveMultipleFaceImages(employeeId, captures);

      return { success: true, captures };
    } catch (error: any) {
      console.error('Error capturing multiple angles:', error);
      return { success: false, error: error.message || 'Failed to capture faces' };
    }
  },

  /**
   * Check if models are loaded
   */
  async areModelsLoaded(): Promise<boolean> {
    return await loadModels();
  }
};
