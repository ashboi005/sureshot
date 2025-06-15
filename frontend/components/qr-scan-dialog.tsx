import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5Qrcode } from 'html5-qrcode';
import useUser from "@/hooks/useUser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QRScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete?: (scheduleId: string, notes: string) => void;
}

export function QRScanDialog({ open, onOpenChange, onScanComplete }: QRScanDialogProps) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [cameras, setCameras] = useState<{id: string, label: string}[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [cameraLoading, setCameraLoading] = useState(false);
  
  // QR scanner references
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
    // QR data state
  const [qrData, setQrData] = useState<{
    user_id?: string;
    vaccine_template_id?: string;
    dose_number?: string;
  } | null>(null);
  
  // Load available cameras
  const loadCameras = async () => {
    setCameraLoading(true);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const cameraList = devices.map(device => ({
          id: device.id,
          label: device.label || `Camera ${device.id}`
        }));
        setCameras(cameraList);
        // Select the first camera by default
        if (cameraList.length > 0 && !selectedCamera) {
          setSelectedCamera(cameraList[0].id);
        }
      } else {
        toast.error("No cameras found on your device");
      }
    } catch (error) {
      console.error("Error getting cameras:", error);
      toast.error("Failed to access camera. Please check permissions.");
    } finally {
      setCameraLoading(false);
    }
  };

  // Start QR scanner
  const startQRScanner = () => {
    if (!selectedCamera) {
      toast.error("Please select a camera first");
      return;
    }
    setScanning(true);
    // Reset QR data when starting a new scan
    setQrData(null);
    console.log("Starting QR scanner with camera:", selectedCamera);
  };
  
  // Stop and clean up scanner
  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(error => {
        console.error("Failed to stop scanner:", error);
      });
      qrScannerRef.current = null;
    }
    setScanning(false);
    console.log("Stopping QR scanner");
  };  // Parse QR content to extract user_id, vaccine_template_id, and dose_number
  const parseQRCode = (qrContent: string) => {
    try {
      console.log("Scanned QR content:", qrContent);
      
      // Clean up the input - normalize slashes, remove trailing slashes
      const cleanedContent = qrContent.trim().replace(/\/{2,}/g, '/').replace(/\/+$/, '');
      console.log("Cleaned QR content:", cleanedContent);
      
      // Initialize extracted data object
      let extractedData: {
        user_id?: string;
        vaccine_template_id?: string;
        dose_number?: string;
      } = {};
      
      // Only support Format 1: Direct path with query parameters: doctor/{user-id}/{vaccine-id}?dose={dose_number}
      let pathPart = cleanedContent;
      let queryParams: URLSearchParams | null = null;
      
      // Check if the content has query parameters
      const parts = cleanedContent.split('?');
      if (parts.length > 1) {
        pathPart = parts[0];
        try {
          queryParams = new URLSearchParams('?' + parts[1]);
          if (queryParams.has('dose')) {
            extractedData.dose_number = queryParams.get('dose') || undefined;
          }
        } catch (err) {
          console.log("Failed to parse query params:", err);
        }
      }
      
      // Extract user_id and vaccine_template_id from the path using regex
      const directPathRegex = /doctor\/([^\/\s\?]+)\/([^\/\s\?]+)/i;
      const directMatch = pathPart.match(directPathRegex);
      
      if (directMatch && directMatch.length >= 3) {
        extractedData.user_id = directMatch[1];
        extractedData.vaccine_template_id = directMatch[2];
        
        console.log("Extracted QR data:", extractedData);
        setQrData(extractedData);
        return true;
      }
      
      console.log("QR Code parsed but no valid data found");
      toast.error("QR code format not recognized. Please scan a valid vaccine QR code in format doctor/{user-id}/{vaccine-id}?dose={dose_number}");
      return false;
    } catch (error) {
      console.error("Failed to parse QR code:", error);
      toast.error("Error processing QR code. Please try again.");
      return false;
    }
  };
  // Handle form submission
  const handleSubmit = () => {
    if (!qrData || !qrData.user_id || !qrData.vaccine_template_id) {
      toast.error("Invalid QR code data");
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate the doctor route URL with dose parameter if available
      let doctorRoute = `/doctor/${qrData.user_id}/${qrData.vaccine_template_id}`;
      
      // Add dose number as query parameter if available
      if (qrData.dose_number) {
        doctorRoute += `?dose=${qrData.dose_number}`;
      }
      
      console.log("Redirecting to:", doctorRoute);
      
      // Redirect to the doctor route
      router.push(doctorRoute);
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Failed to process QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };  // Setup QR scanner when scanning is enabled
  useEffect(() => {
    if (scanning && open && selectedCamera) {
      const onScanSuccess = (decodedText: string) => {
        console.log("Scan success:", decodedText);
        // Play a success sound
        const audio = new Audio("/scan-success.mp3");
        audio.volume = 0.5;
        audio.play().catch(err => console.log("Audio play error:", err));
        
        // Stop scanning
        stopScanner();
        
        // Parse the QR code
        const isValid = parseQRCode(decodedText);
        
        if (!isValid) {
          // If invalid, re-enable scanning after a delay
          setTimeout(() => {
            startQRScanner();
          }, 2000);
        }
      };

      const onScanFailure = (error: string) => {
        // Just log the error, don't show it to the user
        console.warn(`QR scan error: ${error}`);
      };

      setTimeout(() => {
        const container = document.getElementById("qr-scanner-container");        if (container && !qrScannerRef.current) {
          // Configure scanner with improved settings
          qrScannerRef.current = new Html5QrcodeScanner(
            "qr-scanner-container",
            {
              fps: 15, // Increased FPS for better responsiveness
              qrbox: { width: 300, height: 300 }, // Larger scanning area
              supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
              rememberLastUsedCamera: false, // Don't remember last used camera, we're explicitly selecting
              showTorchButtonIfSupported: true, // Add flashlight support if available
              aspectRatio: 1.0, // Square aspect ratio
              formatsToSupport: [0, 12], // Explicitly support QR_CODE and AZTEC formats
              videoConstraints: {
                deviceId: selectedCamera
              }
            },
            false
          );

          qrScannerRef.current.render(onScanSuccess, onScanFailure);
          
          // Add a listener for when the camera becomes ready
          document.addEventListener('camera-ready', () => {
            console.log("Camera initialized successfully with device ID:", selectedCamera);
          });
        }
      }, 500);
    }
    
    return () => {
      if (scanning) {
        stopScanner();
      }
    };
  }, [scanning, open, selectedCamera]);
  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Load cameras when dialog opens
  useEffect(() => {
    if (open && cameras.length === 0) {
      loadCameras();
    }
  }, [open, cameras.length]);

  // Load cameras on component mount
  useEffect(() => {
    loadCameras();
  }, []);

  return (    <Dialog 
      open={open} 
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          if (scanning) {
            stopScanner();
          }
          // Reset state when dialog is closed
          setQrData(null);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Scan Vaccine QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {!qrData ? (
            scanning ? (            <div className="flex flex-col items-center gap-4">
                <div className="w-full rounded-xl overflow-hidden bg-gray-50 border-2 border-blue-200 shadow-md relative">
                  {/* Animated scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="w-full h-1 bg-blue-500 opacity-70 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Scanner container */}
                  <div
                    id="qr-scanner-container"
                    ref={scannerContainerRef}
                    className="w-full h-[320px]"
                  ></div>
                </div>
                
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Position QR code in the center
                  </p>
                  <p className="text-xs text-gray-500">
                    Hold steady and ensure good lighting
                  </p>
                </div>
                
                <style jsx global>{`
                  @keyframes scan {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(320px); }
                    100% { transform: translateY(0); }
                  }
                  
                  /* Improve HTML5 QR Scanner UI */
                  #qr-scanner-container video {
                    object-fit: cover !important;
                    border-radius: 4px;
                  }
                  
                  #qr-scanner-container img {
                    display: none !important;
                  }
                  
                  #qr-scanner-container div:has(select) {
                    margin-bottom: 10px !important;
                  }
                    #qr-scanner-container select {
                    border-radius: 4px !important;
                    padding: 4px 8px !important;
                    font-size: 14px !important;
                    color: black !important;
                  }
                `}</style>
                
                <Button 
                  onClick={stopScanner}
                  variant="outline"
                  className="w-full"
                >
                  Cancel Scan
                </Button>
              </div>
            ) : (              <div className="flex flex-col items-center gap-6 py-6">
                <div className="rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <svg 
                    className="w-16 h-16 text-blue-500" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4v1m6 11h2m-6 0h-2m0 0v7m0-7h-6m6 0l-4-4m0 0l4-4m-4 4h12" 
                    />
                  </svg>
                </div>
                <div className="text-center space-y-2 max-w-xs">
                  <h3 className="text-lg font-semibold">Scan Patient QR Code</h3>
                  <p className="text-sm text-gray-500">
                    Scan a QR code in format: doctor/&#123;user-id&#125;/&#123;vaccine-id&#125;?dose=&#123;dose_number&#125;
                  </p>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="camera-select" className="text-black">Select Camera</Label>
                    {cameraLoading ? (
                      <div className="h-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    ) : cameras.length > 0 ? (                      <Select
                        value={selectedCamera}
                        onValueChange={setSelectedCamera}
                      >
                        <SelectTrigger className="w-full text-black">
                          <SelectValue placeholder="Select camera" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className='text-black'>
                          {cameras.map(camera => (
                            <SelectItem key={camera.id} value={camera.id} className="text-black">
                              {camera.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No cameras detected</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {cameras.length === 0 && !cameraLoading && (
                      <Button 
                        onClick={loadCameras}
                        variant="outline"
                        className="w-full"
                      >
                        <svg 
                          className="w-5 h-5 mr-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                        Detect Cameras
                      </Button>
                    )}
                    
                    <Button 
                      onClick={startQRScanner}
                      disabled={!selectedCamera}
                      className="text-black w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6"
                    >
                      <svg 
                        className="w-5 h-5 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                      Start Camera
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4 pt-2">             
             <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-800">
                  QR Code detected in format doctor/&#123;user-id&#125;/&#123;vaccine-id&#125;?dose=&#123;dose_number&#125;! Please verify the details below.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient-id" className="text-gray-700">Patient ID</Label>
                <Input 
                  id="patient-id" 
                  value={qrData.user_id} 
                  readOnly 
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vaccine-id" className="text-gray-700">Vaccine ID</Label>
                <Input 
                  id="vaccine-id" 
                  value={qrData.vaccine_template_id} 
                  readOnly 
                  className="bg-gray-50 border-gray-200"
                />
              </div>
                <div className="space-y-2 mb-4">
                {qrData.dose_number && (
                  <div className="space-y-2">
                    <Label htmlFor="dose-number" className="text-gray-700">Dose Number</Label>
                    <Input 
                      id="dose-number" 
                      value={qrData.dose_number} 
                      readOnly 
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setQrData(null);
                    startQRScanner();
                  }}
                >
                  Scan Again
                </Button>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className={loading ? "opacity-70" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Continue</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
