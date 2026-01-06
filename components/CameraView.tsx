
import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (photo: string) => void;
  onCancel: () => void;
  isRemote?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel, isRemote = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported or restricted (check if you are on HTTPS).");
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          },
          audio: false
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please allow camera permissions in your settings to proceed.");
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startPhotoSequence = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      capturePhoto();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure dimensions are ready
      if (video.videoWidth === 0) return;

      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        const sourceWidth = video.videoWidth;
        const sourceHeight = video.videoHeight;
        const targetRatio = 9/16;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (sourceWidth / sourceHeight > targetRatio) {
          drawHeight = sourceHeight;
          drawWidth = sourceHeight * targetRatio;
          offsetX = (sourceWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = sourceWidth;
          drawHeight = sourceWidth / targetRatio;
          offsetX = 0;
          offsetY = (sourceHeight - drawHeight) / 2;
        }

        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center bg-white p-12 rounded-[50px] shadow-2xl max-w-sm text-center border-4 border-slate-50">
        <div className="text-red-400 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-4 serif text-slate-900">Permission Needed</h3>
        <p className="text-slate-500 mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-[20px] font-bold shadow-lg">Refresh Page</button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center w-full ${isRemote ? 'max-w-md h-full' : 'max-w-xl aspect-[9/16]'} bg-slate-900 ${isRemote ? 'rounded-[40px]' : 'rounded-[80px]'} overflow-hidden shadow-2xl border-[12px] border-white`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover transform scale-x-[-1]"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 flex flex-col items-center justify-between p-10 md:p-14 bg-gradient-to-b from-black/20 via-transparent to-black/40">
        <div className="w-full text-center">
          <h2 className="text-white text-3xl md:text-4xl font-bold drop-shadow-2xl serif tracking-tight">Strike a Pose!</h2>
          <p className="text-white/70 text-xs mt-2 uppercase tracking-widest font-medium">Captured live @ Book Haraj</p>
        </div>

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[4px]">
            <span className="text-white text-[12rem] md:text-[15rem] font-black drop-shadow-2xl animate-ping">
              {countdown === 0 ? "📸" : countdown}
            </span>
          </div>
        )}

        {countdown === null && (
          <div className="flex flex-col items-center gap-8 md:gap-10 w-full">
            <button
              onClick={startPhotoSequence}
              className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all group border-[10px] md:border-[12px] border-white/20"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-800 rounded-full flex items-center justify-center group-hover:bg-amber-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.103-1.103A2 2 0 0011.188 3H8.812a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            {!isRemote && (
              <button 
                onClick={onCancel}
                className="px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[30px] text-white text-sm font-bold hover:bg-white/20 transition-all"
              >
                Go Back
              </button>
            )}
          </div>
        )}

        <div className="bg-amber-500/90 backdrop-blur-md px-6 py-2 rounded-full text-white text-[9px] tracking-[0.2em] uppercase font-black shadow-lg">
          {countdown === null ? "Snap when ready" : "Hold Still..."}
        </div>
      </div>
    </div>
  );
};

export default CameraView;
