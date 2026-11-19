import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (photo: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
  isRemote?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel, onSkip, isRemote = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported on this browser.");
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
      } catch {
        setError("Camera access denied. Please allow permissions in your settings.");
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

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCapture(dataUrl);
    }
  };

  if (error) {
    return (
      <div className="liquid-glass-modal flex flex-col items-center p-8 rounded-[36px] max-w-sm text-center mx-6 animate-fade-in text-[#2b241e]">
        <h3 className="text-xl font-bold mb-2 text-[#2b241e] tracking-tight">Camera Permission Needed</h3>
        <p className="text-[#5c5147] mb-7 text-sm leading-relaxed">{error}</p>
        <div className="w-full space-y-2.5">
          <button onClick={() => window.location.reload()} className="liquid-cta w-full py-3.5 rounded-full font-bold text-xs active:scale-[0.98]">Retry Access</button>
          {onSkip && (
            <button onClick={onSkip} className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-full font-semibold text-xs active:scale-[0.98]">
              Skip Photo & Continue
            </button>
          )}
          <button onClick={onCancel} className="w-full py-2.5 text-[#5c5147] hover:text-[#2b241e] font-medium text-xs">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center w-full transition-all duration-500 ${isRemote ? 'h-screen w-screen max-w-none' : 'liquid-glass p-2.5 max-w-lg aspect-[9/16] rounded-[48px]'} overflow-hidden`}>
      <div className={`relative w-full h-full overflow-hidden bg-[#2b241e] ${isRemote ? '' : 'rounded-[38px]'}`}>
        {/* Back Button */}
        <button
          onClick={onCancel}
          className="absolute top-6 left-6 z-[60] w-11 h-11 rounded-full bg-[#2b241e]/65 border border-white/25 backdrop-blur-md flex items-center justify-center text-white active:scale-95"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
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

        {/* Overlays over video scrim */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-black/55 via-transparent to-black/75 pointer-events-none">
          <div className="w-full text-center mt-10">
            <h2 className="text-white text-3xl font-extrabold tracking-tight drop-shadow-lg leading-none">Photo Souvenir</h2>
            <p className="text-white/85 text-xs font-medium mt-2">Tap the shutter when ready</p>
          </div>

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
              <span className="text-white text-[10rem] md:text-[13rem] font-extrabold drop-shadow-2xl animate-ping tabular-nums">
                {countdown === 0 ? "📸" : countdown}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 w-full mb-4 pointer-events-auto">
            <button
              onClick={startPhotoSequence}
              className="bg-white/25 border border-white/40 backdrop-blur-md w-24 h-24 rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-transform shadow-2xl"
              aria-label="Take Photo"
            >
              <div className="liquid-cta w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#f7f3ec]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.103-1.103A2 2 0 0011.188 3H8.812a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {onSkip && (
                <button onClick={onSkip} className="bg-[#2b241e]/65 border border-white/25 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-xs font-semibold hover:bg-[#2b241e]/80">
                  Skip Photo
                </button>
              )}
              <button onClick={onCancel} className="bg-[#2b241e]/65 border border-white/25 backdrop-blur-md px-5 py-2.5 rounded-full text-white/90 hover:text-white text-xs font-medium">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraView;