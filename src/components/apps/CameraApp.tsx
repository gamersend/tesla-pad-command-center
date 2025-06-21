
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Settings, RotateCcw, Download, Play, Square, Image, AlertTriangle, X } from 'lucide-react';

interface CapturePhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  metadata: any;
  options: any;
}

interface DocumentationSession {
  id: string;
  type: string;
  name: string;
  started: number;
  photos: CapturePhoto[];
  metadata: any;
  completed: boolean;
}

const CameraApp: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mirrorMode, setMirrorMode] = useState(true);
  const [captureHistory, setCaptureHistory] = useState<CapturePhoto[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [documentationMode, setDocumentationMode] = useState(false);
  const [currentSession, setCurrentSession] = useState<DocumentationSession | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const constraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'
    },
    audio: false
  };

  const documentationTypes = {
    service_visit: {
      name: 'Service Visit Documentation',
      photos: ['before_service', 'issue_detail', 'after_service'],
      description: 'Document service center visit'
    },
    accident_report: {
      name: 'Accident Documentation',
      photos: ['overview', 'damage_detail', 'other_vehicles', 'scene'],
      description: 'Document accident or incident'
    },
    delivery_inspection: {
      name: 'Delivery Inspection',
      photos: ['exterior_front', 'exterior_rear', 'exterior_sides', 'interior'],
      description: 'Document new vehicle delivery'
    },
    modification_install: {
      name: 'Modification Installation',
      photos: ['before_install', 'during_install', 'after_install'],
      description: 'Document vehicle modifications'
    }
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Safety check - simulate Tesla API vehicle state check
  useEffect(() => {
    if (isActive) {
      const safetyCheck = setInterval(() => {
        // Simulate vehicle state check
        // In real implementation, this would call teslaAPI.getVehicleState()
        const isParked = true; // Mock: vehicle is in park
        
        if (!isParked) {
          stopCamera();
          setSafetyWarning('Camera disabled - vehicle must be in park for safety');
        }
      }, 5000);

      return () => clearInterval(safetyCheck);
    }
  }, [isActive]);

  const requestCameraAccess = async () => {
    try {
      // Mock Tesla safety check
      const vehicleState = { shift_state: 'P' }; // Mock parked state
      
      if (vehicleState.shift_state !== 'P') {
        setSafetyWarning('Camera only available when vehicle is parked');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

    } catch (error: any) {
      let message = 'Camera access failed';
      
      if (error.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (error.name === 'NotFoundError') {
        message = 'No camera found on this device.';
      }
      
      setSafetyWarning(message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  };

  const capturePhoto = async (options: any = {}) => {
    if (!isActive || !stream || !videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (mirrorMode) {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      // Add timestamp overlay
      if (options.includeTimestamp !== false) {
        addTimestampOverlay(ctx, canvas);
      }

      // Add Tesla metadata overlay
      if (options.includeTeslaData) {
        await addTeslaMetadataOverlay(ctx, canvas);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      const capture: CapturePhoto = {
        id: `capture_${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
        metadata: await generateCaptureMetadata(),
        options
      };

      setCaptureHistory(prev => [...prev, capture]);

      // Add to current documentation session if active
      if (currentSession && documentationMode) {
        setCurrentSession(prev => prev ? {
          ...prev,
          photos: [...prev.photos, capture]
        } : null);
      }

      return capture;

    } catch (error) {
      console.error('Photo capture failed:', error);
      setSafetyWarning('Failed to capture photo');
    }
  };

  const addTimestampOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const timestamp = new Date().toLocaleString();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 200, canvas.height - 40, 190, 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(timestamp, canvas.width - 10, canvas.height - 20);
  };

  const addTeslaMetadataOverlay = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    try {
      // Mock Tesla vehicle data
      const vehicleData = {
        display_name: 'Model 3 Performance',
        vehicle_state: { odometer: 15420 },
        charge_state: { battery_level: 87 }
      };

      const metadata = [
        vehicleData.display_name,
        `${vehicleData.vehicle_state.odometer} miles`,
        `${vehicleData.charge_state.battery_level}% charge`
      ];

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 180, 80);

      ctx.fillStyle = '#E31937';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('TESLA', 20, 30);

      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      metadata.forEach((text, index) => {
        ctx.fillText(text, 20, 50 + (index * 15));
      });
    } catch (error) {
      console.warn('Failed to add Tesla metadata overlay:', error);
    }
  };

  const generateCaptureMetadata = async () => {
    return {
      resolution: {
        width: canvasRef.current?.width || 0,
        height: canvasRef.current?.height || 0
      },
      timestamp: Date.now(),
      mirrorMode,
      tesla: {
        vehicleId: 'mock_id',
        displayName: 'Model 3 Performance',
        odometer: 15420,
        batteryLevel: 87
      }
    };
  };

  const startDocumentation = (type: keyof typeof documentationTypes) => {
    const docType = documentationTypes[type];
    
    const session: DocumentationSession = {
      id: `doc_${Date.now()}`,
      type,
      name: docType.name,
      started: Date.now(),
      photos: [],
      metadata: {},
      completed: false
    };

    setCurrentSession(session);
    setDocumentationMode(true);
    
    if (!isActive) {
      requestCameraAccess();
    }
  };

  const exportCaptures = () => {
    const exportData = {
      version: '1.0.0',
      exported: Date.now(),
      captures: captureHistory.map(capture => ({
        id: capture.id,
        timestamp: capture.timestamp,
        metadata: capture.metadata,
        options: capture.options,
        hasImage: true
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tesla_camera_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-black text-white relative overflow-hidden">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-5 z-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Camera & Mirror</h1>
          <div className="flex items-center gap-2 text-sm text-white/70">
            {isActive && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Live</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="h-full flex items-center justify-center relative">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${mirrorMode ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-white/60 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
              <Camera size={32} />
            </div>
            <div className="text-lg font-medium">Camera Ready</div>
            <div className="text-sm max-w-xs leading-relaxed">
              Tap the camera button to start. Camera is only available when vehicle is parked.
            </div>
          </div>
        )}
      </div>

      {/* Info Overlay */}
      {isActive && (
        <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-md p-3 rounded-2xl text-center min-w-[120px] z-40">
          <div className="font-semibold text-sm mb-1">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-xs text-white/80 leading-tight">
            Model 3 Performance<br />
            15,420 miles<br />
            87% charge
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-10 pb-5 flex items-center justify-center gap-5">
        {/* Mirror Toggle */}
        <button
          onClick={() => setMirrorMode(!mirrorMode)}
          className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <RotateCcw size={24} />
        </button>

        {/* Main Capture Button */}
        <button
          onClick={() => isActive ? capturePhoto({ includeTimestamp: true, includeTeslaData: true }) : requestCameraAccess()}
          className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors border-4 border-white/30"
        >
          {isActive ? <Camera size={28} /> : <Play size={28} />}
        </button>

        {/* Stop Camera */}
        {isActive && (
          <button
            onClick={stopCamera}
            className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Square size={24} />
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Capture Preview */}
      {captureHistory.length > 0 && (
        <button
          onClick={() => setShowGallery(true)}
          className="absolute bottom-24 left-5 w-15 h-15 rounded-lg border-2 border-white/30 overflow-hidden hover:border-white/60 transition-colors relative"
        >
          <img
            src={captureHistory[captureHistory.length - 1].dataUrl}
            alt="Latest capture"
            className="w-full h-full object-cover"
          />
          {captureHistory.length > 1 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
              {captureHistory.length}
            </div>
          )}
        </button>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-xl rounded-2xl p-5 min-w-[200px] z-50">
          <div className="mb-5">
            <div className="text-sm font-medium mb-2 text-white/90">Brightness</div>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-1 bg-white/30 rounded appearance-none cursor-pointer"
            />
          </div>
          
          <div className="mb-5">
            <div className="text-sm font-medium mb-2 text-white/90">Contrast</div>
            <input
              type="range"
              min="0"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full h-1 bg-white/30 rounded appearance-none cursor-pointer"
            />
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMirrorMode(!mirrorMode)}>
              <div className={`relative w-11 h-6 bg-white/30 rounded-full transition-colors ${mirrorMode ? 'bg-green-500' : ''}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${mirrorMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-white/90">Mirror Mode</span>
            </div>
          </div>

          <hr className="border-white/20 mb-5" />
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/90 mb-3">Documentation Mode</div>
            {Object.entries(documentationTypes).map(([key, type]) => (
              <button
                key={key}
                onClick={() => startDocumentation(key as keyof typeof documentationTypes)}
                className="w-full text-left p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-xs text-white/70">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col">
          <div className="bg-black/80 p-5 flex items-center justify-between text-white">
            <h2 className="text-xl font-semibold">Camera Gallery</h2>
            <div className="flex gap-3">
              <button
                onClick={exportCaptures}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => setShowGallery(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {captureHistory.map((capture) => (
                <div key={capture.id} className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer hover:scale-105 transition-transform">
                  <img
                    src={capture.dataUrl}
                    alt="Capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-xs">
                      {new Date(capture.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety Warning */}
      {safetyWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-red-500 text-white p-6 rounded-2xl text-center max-w-sm mx-4">
            <AlertTriangle size={32} className="mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Safety Notice</h3>
            <p className="text-sm opacity-90 leading-relaxed mb-4">{safetyWarning}</p>
            <button
              onClick={() => setSafetyWarning(null)}
              className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Documentation Session Status */}
      {documentationMode && currentSession && (
        <div className="absolute top-20 left-5 bg-blue-500/90 backdrop-blur-md p-4 rounded-xl text-white max-w-xs">
          <div className="font-semibold text-sm mb-1">{currentSession.name}</div>
          <div className="text-xs opacity-90">
            {currentSession.photos.length} photos captured
          </div>
          <button
            onClick={() => {
              setDocumentationMode(false);
              setCurrentSession(null);
            }}
            className="mt-2 px-3 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
          >
            Complete Session
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraApp;
