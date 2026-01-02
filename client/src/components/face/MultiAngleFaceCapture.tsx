import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, User, Loader2 } from 'lucide-react';
import { Button, Badge } from '../common/UIComponents';
import { faceRecognitionService, FaceAngle, captureFaceFromVideo } from '../../services/faceRecognitionService';
import { toast } from 'sonner';

interface MultiAngleFaceCaptureProps {
  employeeId: string;
  onComplete: () => void;
  onCancel: () => void;
  isVerification?: boolean; // If true, only verify (don't capture multiple angles)
}

const ANGLES: Array<{ angle: FaceAngle; label: string; icon: React.ReactNode; instruction: string }> = [
  { angle: 'front', label: 'Front', icon: <User size={24} />, instruction: 'Look straight at the camera' },
  { angle: 'left', label: 'Left', icon: <ArrowLeft size={24} />, instruction: 'Turn your head to the left' },
  { angle: 'right', label: 'Right', icon: <ArrowRight size={24} />, instruction: 'Turn your head to the right' },
  { angle: 'up', label: 'Up', icon: <ArrowUp size={24} />, instruction: 'Look up slightly' },
  { angle: 'down', label: 'Down', icon: <ArrowDown size={24} />, instruction: 'Look down slightly' }
];

export default function MultiAngleFaceCapture({ 
  employeeId, 
  onComplete, 
  onCancel,
  isVerification = false 
}: MultiAngleFaceCaptureProps) {
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedAngles, setCapturedAngles] = useState<Set<FaceAngle>>(new Set());
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const currentAngle = isVerification ? 'front' : ANGLES[currentAngleIndex].angle;
  const isLastAngle = isVerification || currentAngleIndex === ANGLES.length - 1;
  const allAnglesCaptured = isVerification || capturedAngles.size === ANGLES.length;

  useEffect(() => {
    // Load face-api.js models
    loadModels();
    startCamera();

    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Restart camera when angle changes
    if (!isVerification) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  }, [currentAngleIndex, isVerification]);

  const loadModels = async () => {
    try {
      setModelsLoading(true);
      const loaded = await faceRecognitionService.areModelsLoaded();
      if (!loaded) {
        toast.warning('Face recognition models are loading. Please wait...');
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load face recognition models');
    } finally {
      setModelsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setCameraReady(false);
    setFaceDetected(false);
  };

  const startFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Check for face every 500ms
    detectionIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !cameraReady) return;

      try {
        const result = await captureFaceFromVideo(videoRef.current);
        setFaceDetected(result?.detected || false);
      } catch (error) {
        // Silently handle detection errors
      }
    }, 500);
  };

  const captureCurrentAngle = async () => {
    if (!videoRef.current || !faceDetected || isCapturing) return;

    try {
      setIsCapturing(true);
      setIsProcessing(true);

      if (isVerification) {
        // Verification mode - just verify against stored faces
        const imageData = await captureFaceFromVideo(videoRef.current);
        if (!imageData || !imageData.detected) {
          toast.error('No face detected. Please ensure your face is clearly visible.');
          return;
        }

        const verification = await faceRecognitionService.verifyFace(
          employeeId,
          imageData.imageData
        );

        if (verification.verified) {
          toast.success(`Face verified! Confidence: ${verification.confidence.toFixed(1)}%`);
          onComplete();
        } else {
          toast.error(`Face verification failed. Confidence: ${verification.confidence.toFixed(1)}%`);
        }
      } else {
        // Registration mode - capture multiple angles
        const result = await faceRecognitionService.captureAndSaveFace(
          employeeId,
          videoRef.current,
          currentAngle
        );

        if (result.success) {
          setCapturedAngles(prev => new Set([...prev, currentAngle]));
          toast.success(`${ANGLES[currentAngleIndex].label} angle captured!`);

          // Move to next angle or complete
          if (isLastAngle) {
            // All angles captured
            toast.success('All face angles captured successfully!');
            onComplete();
          } else {
            // Move to next angle
            setCurrentAngleIndex(prev => prev + 1);
            setFaceDetected(false);
          }
        } else {
          toast.error(result.error || 'Failed to capture face');
        }
      }
    } catch (error: any) {
      console.error('Error capturing face:', error);
      toast.error(error.message || 'Failed to capture face');
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentAngleIndex < ANGLES.length - 1) {
      setCurrentAngleIndex(prev => prev + 1);
      setFaceDetected(false);
    }
  };

  const handlePrevious = () => {
    if (currentAngleIndex > 0) {
      setCurrentAngleIndex(prev => prev - 1);
      setFaceDetected(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-white/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Camera size={28} className="text-primary" />
                {isVerification ? 'Face Verification' : 'Multi-Angle Face Registration'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isVerification 
                  ? 'Please look at the camera to verify your identity'
                  : 'Capture your face from multiple angles for better recognition'
                }
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <XCircle size={20} />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        {!isVerification && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Angle {currentAngleIndex + 1} of {ANGLES.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {capturedAngles.size} / {ANGLES.length} captured
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentAngleIndex + 1) / ANGLES.length) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              {ANGLES.map((angle, idx) => (
                <div
                  key={angle.angle}
                  className={`flex-1 h-1 rounded ${
                    idx === currentAngleIndex
                      ? 'bg-primary'
                      : capturedAngles.has(angle.angle)
                      ? 'bg-green-500'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Camera View */}
        <div className="p-6">
          {modelsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="text-muted-foreground">Loading face recognition models...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Angle Info */}
              {!isVerification && (
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {ANGLES[currentAngleIndex].icon}
                    <h3 className="text-lg font-semibold">
                      {ANGLES[currentAngleIndex].label} Angle
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ANGLES[currentAngleIndex].instruction}
                  </p>
                </div>
              )}

              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Face Detection Indicator */}
                <div className="absolute top-4 right-4">
                  {faceDetected ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      Face Detected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <XCircle size={14} />
                      No Face
                    </Badge>
                  )}
                </div>

                {/* Face Frame Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-48 h-64 border-2 rounded-lg transition-all ${
                    faceDetected ? 'border-green-400' : 'border-yellow-400/50'
                  }`} />
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">
                  {isVerification
                    ? 'Position your face within the frame and click "Verify Face" when ready.'
                    : 'Position your face within the frame. Make sure your face is clearly visible and well-lit.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {!isVerification && currentAngleIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious} disabled={isCapturing}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isCapturing}>
              Cancel
            </Button>
            <Button
              onClick={captureCurrentAngle}
              disabled={!cameraReady || !faceDetected || isCapturing || modelsLoading}
              className="min-w-[140px]"
            >
              {isCapturing || isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  {isVerification ? 'Verifying...' : 'Capturing...'}
                </>
              ) : (
                <>
                  <Camera className="mr-2" size={16} />
                  {isVerification ? 'Verify Face' : 'Capture'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

