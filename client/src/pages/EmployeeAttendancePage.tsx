import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Camera, CheckCircle, XCircle, AlertCircle, Loader2, Clock, History, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/common/UIComponents';
import Modal from '../components/common/Modal';
import { attendanceLocationService, AttendanceLocationSettings } from '../services/attendanceLocationService';
import { employeeAttendanceLocationService, EmployeeAttendanceLocation } from '../services/employeeAttendanceLocationService';
import { faceRecognitionService, captureFaceFromVideo } from '../services/faceRecognitionService';
import MultiAngleFaceCapture from '../components/face/MultiAngleFaceCapture';
import { attendanceService, AttendanceLog } from '../services/attendanceService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { StatusBadge } from '../components/common/StatusBadge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

export default function EmployeeAttendancePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [locationSettings, setLocationSettings] = useState<AttendanceLocationSettings | null>(null);
  const [employeeLocation, setEmployeeLocation] = useState<EmployeeAttendanceLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocationSettingsModalOpen, setIsLocationSettingsModalOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({
    location_name: '',
    google_maps_link: '',
    radius_meters: 100,
    is_active: true,
    use_company_default: true
  });
  const [locationVerified, setLocationVerified] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  const [hasFaceImage, setHasFaceImage] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [punchType, setPunchType] = useState<'check_in' | 'check_out' | null>(null);
  const [isFaceCaptureModalOpen, setIsFaceCaptureModalOpen] = useState<boolean>(false);
  const [isAttendanceLogModalOpen, setIsAttendanceLogModalOpen] = useState<boolean>(false);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (user?.company_id) {
      loadLocationSettings();
      checkFaceImage();
    }
    if (user?.employee_id) {
      loadEmployeeLocation();
    }
    return () => {
      // Cleanup video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user?.company_id, user?.employee_id]);

  // Note: Camera is now managed by MultiAngleFaceCapture component

  const loadLocationSettings = async () => {
    if (!user?.company_id) return;
    try {
      const settings = await attendanceLocationService.getByCompany(user.company_id);
      setLocationSettings(settings);
    } catch (error) {
      console.error('Error loading location settings:', error);
      toast.error('Failed to load attendance location settings');
    }
  };

  const loadEmployeeLocation = async () => {
    if (!user?.employee_id) return;
    try {
      const location = await employeeAttendanceLocationService.getByEmployee(user.employee_id);
      setEmployeeLocation(location);
      if (location) {
        setLocationForm({
          location_name: location.location_name,
          google_maps_link: location.google_maps_link || '',
          radius_meters: location.radius_meters,
          is_active: location.is_active,
          use_company_default: location.use_company_default
        });
      }
    } catch (error) {
      console.error('Error loading employee location:', error);
    }
  };

  const checkFaceImage = async () => {
    if (!user?.employee_id) return;
    try {
      const faceImage = await faceRecognitionService.getPrimaryFaceImage(user.employee_id);
      setHasFaceImage(!!faceImage);
    } catch (error) {
      console.error('Error checking face image:', error);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser. Please use a modern browser with location services enabled.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = 'Failed to get your location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access was denied. Please allow location access in your browser settings and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Please check your device location settings.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please ensure your device has a clear view of the sky (for GPS) or is connected to WiFi/network, and try again.';
              break;
            default:
              errorMessage += 'An unknown error occurred. Please try again.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased to 30 seconds
          maximumAge: 60000 // Allow cached location up to 1 minute old
        }
      );
    });
  };

  const verifyLocation = async () => {
    try {
      // Determine which location to use: employee-specific or company default
      const activeLocation = employeeLocation && !employeeLocation.use_company_default && employeeLocation.is_active
        ? employeeLocation
        : locationSettings;

      if (!activeLocation || !activeLocation.latitude || !activeLocation.longitude) {
        toast.error('Attendance location not configured');
        return;
      }

      // Show loading state
      toast.loading('Getting your location...', { id: 'location-verification' });

      const location = await getCurrentLocation();
      setUserLocation(location);

      const verification = attendanceLocationService.verifyLocation(
        location.lat,
        location.lon,
        activeLocation.latitude,
        activeLocation.longitude,
        activeLocation.radius_meters
      );

      setDistance(verification.distance);
      setLocationVerified(verification.verified);

      toast.dismiss('location-verification');

      if (!verification.verified) {
        toast.error(`You are ${verification.distance.toFixed(0)}m away from the location. Please move closer.`, {
          duration: 5000
        });
      } else {
        toast.success('Location verified!', {
          duration: 3000
        });
      }
    } catch (error: any) {
      console.error('Error verifying location:', error);
      toast.dismiss('location-verification');
      
      // Provide more helpful error messages
      if (error.message) {
        toast.error(error.message, {
          duration: 6000
        });
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please ensure your device has GPS/WiFi enabled and try again.', {
          duration: 6000
        });
      } else {
        toast.error('Failed to get your location. Please check your browser permissions and device settings.', {
          duration: 6000
        });
      }
    }
  };

  const handleSaveEmployeeLocation = async () => {
    if (!user?.employee_id) return;
    try {
      // Parse Google Maps link to extract coordinates
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (locationForm.google_maps_link && !locationForm.use_company_default) {
        const coords = await attendanceLocationService.parseGoogleMapsLink(locationForm.google_maps_link);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
        } else {
          toast.error('Could not parse Google Maps link. Please ensure it contains coordinates.');
          return;
        }
      }

      await employeeAttendanceLocationService.upsert({
        employee_id: user.employee_id,
        location_name: locationForm.location_name,
        google_maps_link: locationForm.use_company_default ? null : (locationForm.google_maps_link || null),
        latitude,
        longitude,
        radius_meters: locationForm.radius_meters,
        is_active: locationForm.is_active,
        use_company_default: locationForm.use_company_default
      });

      toast.success('Attendance location saved successfully!');
      setIsLocationSettingsModalOpen(false);
      loadEmployeeLocation();
    } catch (error: any) {
      console.error('Failed to save attendance location', error);
      toast.error(error.message || 'Failed to save attendance location');
    }
  };

  const startCamera = async () => {
    try {
      setCameraReady(false);
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
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setCameraReady(true);
            }).catch((error) => {
              console.error('Error playing video:', error);
              setCameraReady(false);
            });
          }
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please allow camera permissions.');
      setIsFaceCaptureModalOpen(false);
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  const handleFaceCaptureComplete = async () => {
    setIsFaceCaptureModalOpen(false);
    await checkFaceImage();
    if (hasFaceImage) {
      // If verifying, set face verified
      setFaceVerified(true);
    } else {
      // If first time capture, set hasFaceImage
      setHasFaceImage(true);
    }
  };

  const loadAttendanceLogs = async () => {
    if (!user?.employee_id) return;
    try {
      setLoadingLogs(true);
      const logs = await attendanceService.getByEmployee(user.employee_id);
      setAttendanceLogs(logs);
    } catch (error) {
      console.error('Error loading attendance logs:', error);
      toast.error('Failed to load attendance logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const openAttendanceLogs = () => {
    setIsAttendanceLogModalOpen(true);
    loadAttendanceLogs();
  };

  const submitAttendance = async (type: 'check_in' | 'check_out') => {
    if (!user?.employee_id) {
      toast.error('Employee ID not found');
      return;
    }

      // Determine which location settings to use
      const activeSettings = employeeLocation && !employeeLocation.use_company_default && employeeLocation.is_active
        ? { ...locationSettings, latitude: employeeLocation.latitude, longitude: employeeLocation.longitude, radius_meters: employeeLocation.radius_meters, is_active: employeeLocation.is_active }
        : locationSettings;

      // Verify location if required
      if (activeSettings?.is_active) {
        if (!locationVerified) {
          toast.error('Please verify your location first');
          return;
        }
      }

      // Verify face if required (use company settings for face recognition)
      if (locationSettings?.require_face_verification && locationSettings?.face_recognition_enabled) {
        if (!faceVerified && hasFaceImage) {
          toast.error('Please verify your face first');
          return;
        }
      }

    try {
      setIsSubmitting(true);
      setPunchType(type);

      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toISOString();

      // Capture face image if needed for submission
      let faceImageData: string | null = null;
      if (locationSettings?.require_face_verification && videoRef.current) {
        faceImageData = await captureFaceFromVideo(videoRef.current);
      }

      // Create attendance record
      const attendanceData: any = {
        employee_id: user.employee_id,
        date: date,
        [type === 'check_in' ? 'check_in' : 'check_out']: time,
        status: 'Present',
        location_verified: locationVerified,
        face_verified: faceVerified || !hasFaceImage,
        verification_method: locationVerified && faceVerified ? 'geo_face' : 
                             locationVerified ? 'geo_only' : 
                             faceVerified ? 'face_only' : 'manual',
        device_info: navigator.userAgent
      };

      if (userLocation) {
        attendanceData.latitude = userLocation.lat;
        attendanceData.longitude = userLocation.lon;
        if (activeLocation && activeLocation.latitude && activeLocation.longitude) {
          attendanceData.distance_from_location_meters = distance;
        }
      }

      if (faceImageData) {
        attendanceData.face_image_url = faceImageData;
        if (faceVerified) {
          // Get confidence from verification
          const verification = await faceRecognitionService.verifyFace(
            user.employee_id,
            faceImageData
          );
          attendanceData.face_match_confidence = verification.confidence;
        }
      }

      await attendanceService.createPunch(attendanceData);

      toast.success(`${type === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully!`);
      
      // Reset states
      setLocationVerified(false);
      setFaceVerified(false);
      setUserLocation(null);
      setDistance(null);
      stopCamera();
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      toast.error(error.message || 'Failed to submit attendance');
    } finally {
      setIsSubmitting(false);
      setPunchType(null);
    }
  };

  // Determine which location to display
  const activeLocation = employeeLocation && !employeeLocation.use_company_default && employeeLocation.is_active
    ? employeeLocation
    : locationSettings;

  if (!activeLocation && !locationSettings) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
        <p className="text-muted-foreground">Attendance location not configured. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={24} />
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-blue-400" />
                  <span className="font-semibold">
                    {activeLocation?.location_name || locationSettings?.location_name || 'Location'}
                    {employeeLocation && !employeeLocation.use_company_default && (
                      <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>
                    )}
                  </span>
                </div>
                <Button
                  onClick={() => setIsLocationSettingsModalOpen(true)}
                  variant="ghost"
                  size="sm"
                >
                  <MapPin size={16} className="mr-1" />
                  {employeeLocation ? 'Edit' : 'Set'} Location
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Allowed radius: {activeLocation?.radius_meters || locationSettings?.radius_meters || 100}m
                {employeeLocation?.use_company_default && (
                  <span className="ml-2">(Using company default)</span>
                )}
              </p>
            </div>

            {/* Location Verification */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  <span className="font-semibold">Location Verification</span>
                </div>
                {locationVerified ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle size={14} />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Verified</Badge>
                )}
              </div>
              
              {userLocation && (
                <div className="text-sm text-muted-foreground">
                  Your location: {userLocation.lat.toFixed(6)}, {userLocation.lon.toFixed(6)}
                  {distance !== null && (
                    <span className="ml-2">
                      • Distance: {distance.toFixed(0)}m
                    </span>
                  )}
                </div>
              )}

              <Button
                onClick={verifyLocation}
                disabled={isSubmitting}
                className="w-full"
              >
                {locationVerified ? 'Re-verify Location' : 'Verify Location'}
              </Button>
            </div>

            {/* Face Recognition */}
            {locationSettings.face_recognition_enabled && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={20} className="text-purple-400" />
                    <span className="font-semibold">Face Verification</span>
                  </div>
                  {hasFaceImage ? (
                    faceVerified ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Verified</Badge>
                    )
                  ) : (
                    <Badge variant="warning">Setup Required</Badge>
                  )}
                </div>

                {!hasFaceImage && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-400">
                      This is your first time. Please capture your face image for future verification.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setIsFaceCaptureModalOpen(true)}
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Camera size={18} className="mr-2" />
                  {hasFaceImage ? 'Verify Face' : 'Capture Face Image'}
                </Button>
              </div>
            )}

            {/* Attendance Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Button
                onClick={() => submitAttendance('check_in')}
                disabled={!locationVerified || (locationSettings.require_face_verification && !faceVerified && hasFaceImage) || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting && punchType === 'check_in' ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Recording Check-in...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    Check In
                  </>
                )}
              </Button>

              <Button
                onClick={() => submitAttendance('check_out')}
                disabled={!locationVerified || (locationSettings.require_face_verification && !faceVerified && hasFaceImage) || isSubmitting}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isSubmitting && punchType === 'check_out' ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Recording Check-out...
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="mr-2" />
                    Check Out
                  </>
                )}
              </Button>

              <Button
                onClick={openAttendanceLogs}
                variant="outline"
                className="w-full"
              >
                <History size={18} className="mr-2" />
                View Attendance History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Angle Face Capture Modal */}
      {isFaceCaptureModalOpen && user?.employee_id && (
        <MultiAngleFaceCapture
          employeeId={user.employee_id}
          onComplete={handleFaceCaptureComplete}
          onCancel={() => {
            setIsFaceCaptureModalOpen(false);
            stopCamera();
          }}
          isVerification={hasFaceImage}
        />
      )}

      {/* Attendance Logs Modal */}
      <Modal
        isOpen={isAttendanceLogModalOpen}
        onClose={() => setIsAttendanceLogModalOpen(false)}
        title="Attendance History"
        size="xl"
      >
        <div className="space-y-4">
          {loadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : attendanceLogs.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {attendanceLogs.map((log) => (
                <Card key={log.id} className="border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="font-semibold">
                            {new Date(log.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <StatusBadge status={log.status} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {log.check_in && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="text-xs text-muted-foreground mb-1">Check In</div>
                          <div className="font-semibold text-green-400">
                            {new Date(log.check_in).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      )}
                      {log.check_out && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="text-xs text-muted-foreground mb-1">Check Out</div>
                          <div className="font-semibold text-red-400">
                            {new Date(log.check_out).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {(log.late_minutes > 0 || log.overtime_minutes > 0) && (
                      <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
                        {log.late_minutes > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Late: </span>
                            <span className="font-semibold text-orange-400">{log.late_minutes} min</span>
                          </div>
                        )}
                        {log.overtime_minutes > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Overtime: </span>
                            <span className="font-semibold text-blue-400">{log.overtime_minutes} min</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Employee Location Settings Modal */}
      <Modal
        isOpen={isLocationSettingsModalOpen}
        onClose={() => {
          setIsLocationSettingsModalOpen(false);
          loadEmployeeLocation();
        }}
        title="Set Your Attendance Location"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEmployeeLocation(); }} className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              Set a dedicated location for your attendance. If not set, the company default location will be used.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Use Company Default Location</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={locationForm.use_company_default}
                onChange={(e) => setLocationForm({ ...locationForm, use_company_default: e.target.checked })}
                className="w-5 h-5 rounded border-white/20"
              />
              <span className="text-sm text-muted-foreground">
                Use the company's default attendance location
              </span>
            </div>
          </div>

          {!locationForm.use_company_default && (
            <>
              <div className="space-y-2">
                <Label>Location Name *</Label>
                <Input
                  required={!locationForm.use_company_default}
                  value={locationForm.location_name}
                  onChange={(e) => setLocationForm({ ...locationForm, location_name: e.target.value })}
                  placeholder="My Work Location"
                />
              </div>

              <div className="space-y-2">
                <Label>Google Maps Link *</Label>
                <Input
                  required={!locationForm.use_company_default}
                  value={locationForm.google_maps_link}
                  onChange={(e) => setLocationForm({ ...locationForm, google_maps_link: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste a Google Maps link. The system will automatically extract coordinates.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Allowed Radius (meters) *</Label>
                <Input
                  type="number"
                  required={!locationForm.use_company_default}
                  min="10"
                  max="1000"
                  value={locationForm.radius_meters}
                  onChange={(e) => setLocationForm({ ...locationForm, radius_meters: parseInt(e.target.value) || 100 })}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  You must be within this radius to mark attendance (10-1000 meters)
                </p>
              </div>
            </>
          )}

          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable this location setting
                </p>
              </div>
              <input
                type="checkbox"
                checked={locationForm.is_active}
                onChange={(e) => setLocationForm({ ...locationForm, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-white/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLocationSettingsModalOpen(false);
                loadEmployeeLocation();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Location</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

