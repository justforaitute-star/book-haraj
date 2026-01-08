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
        setError("Camera access is not supported or restricted.");
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
        setError("Camera access denied. Please allow permissions.");
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startPhotoSequence = () => setCountdown(3);

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
      
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      if (vWidth === 0 || vHeight === 0) return;

      const targetRatio = 4 / 5;
      const outWidth = 800;
      const outHeight = outWidth / targetRatio;

      canvas.width = outWidth;
      canvas.height = outHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let sWidth, sHeight, sx, sy;
      
      if (vWidth / vHeight > targetRatio) {
        sHeight = vHeight;
        sWidth = vHeight * targetRatio;
        sx = (vWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = vWidth;
        sHeight = vWidth / targetRatio;
        sx = 0;
        sy = (vHeight - sHeight) / 2;
      }

      ctx.translate(outWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, outWidth, outHeight);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center bg-white p-12 rounded-[40px] shadow-2xl max-w-sm text-center">
        <h3 className="text-xl font-bold mb-4 text-black">Permission Needed</h3>
        <p className="text-slate-500 mb-8 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-black text-white rounded-xl font-bold">Refresh</button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center w-full ${isRemote ? 'max-w-md h-full' : 'max-w-xl aspect-[9/16]'} bg-black overflow-hidden shadow-2xl border-[12px] border-white ${isRemote ? 'rounded-none' : 'rounded-[60px]'}`}>
      
      <button 
        onClick={onCancel}
        className="absolute top-8 left-8 z-[60] w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/40 transition-all shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover transform scale-x-[-1]"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 flex flex-col items-center justify-between p-10 bg-gradient-to-b from-black/20 via-transparent to-black/40">
        <div className="w-full text-center">
          <h2 className="text-white text-3xl font-bold drop-shadow-2xl italic tracking-tight uppercase">Strike a Pose!</h2>
        </div>

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[4px] z-50">
            <span className="text-white text-[12rem] font-black drop-shadow-2xl animate-ping">
              {countdown === 0 ? "📸" : countdown}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-10 w-full mb-10">
          <button
            onClick={startPhotoSequence}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all group border-[8px] border-white/20"
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.103-1.103A2 2 0 0011.188 3H8.812a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          <button onClick={onCancel} className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors">
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraView;