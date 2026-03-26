import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

interface PoseTrackerProps {
  onRepCount: (count: number) => void;
  onReady?: () => void;
  exerciseType: 'squat' | 'pushup' | 'jumping_jack' | 'cobra' | 'plank' | 'lunges' | 'high_knees' | 'burpee';
  isActive: boolean;
  minimal?: boolean;
}

const PoseTracker: React.FC<PoseTrackerProps> = ({ onRepCount, onReady, exerciseType, isActive, minimal = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState<'down' | 'up'>('up');
  const [feedback, setFeedback] = useState<string>('Align your body');
  const [positionStatus, setPositionStatus] = useState<'ok' | 'too-close' | 'too-far' | 'out-of-frame'>('ok');
  const [isCorrect, setIsCorrect] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const calculateAngle = (a: any, b: any, c: any) => {
      const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);
      if (angle > 180.0) angle = 360 - angle;
      return angle;
    };

    pose.onResults((results: Results) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        const landmarks = results.poseLandmarks;

        // Position validation logic
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        const torsoHeight = Math.abs(leftShoulder.y - leftHip.y);
        
        const isVisible = (leftShoulder.visibility || 0) > 0.5 && 
                          (rightShoulder.visibility || 0) > 0.5 && 
                          (leftHip.visibility || 0) > 0.5 && 
                          (rightHip.visibility || 0) > 0.5;

        let currentStatus: 'ok' | 'too-close' | 'too-far' | 'out-of-frame' = 'ok';

        const updateFeedback = (newFeedback: string) => {
          setFeedback(prev => {
            if (prev !== newFeedback) return newFeedback;
            return prev;
          });
        };

        if (!isVisible) {
          currentStatus = 'out-of-frame';
          updateFeedback('Move into frame');
        } else if (shoulderWidth > 0.45 || torsoHeight > 0.55) {
          currentStatus = 'too-close';
          updateFeedback('Step back');
        } else if (shoulderWidth < 0.08 && torsoHeight < 0.12) {
          currentStatus = 'too-far';
          updateFeedback('Step closer');
        }

        setPositionStatus(prev => {
          if (prev !== currentStatus) return currentStatus;
          return prev;
        });

        drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, { 
          color: currentStatus !== 'ok' ? '#FF4444' : (isCorrect ? '#00D1FF' : '#FF4444'), 
          lineWidth: 4 
        });
        drawLandmarks(canvasCtx, landmarks, { color: '#FFFFFF', lineWidth: 2 });

        // Logic for rep counting
        if (currentStatus === 'ok') {
          if (exerciseType === 'squat') {
            const hip = landmarks[24];
            const knee = landmarks[26];
            const ankle = landmarks[28];
            const angle = calculateAngle(hip, knee, ankle);

            if (angle > 160) {
              if (stage === 'down') {
                setReps((prev) => {
                  const newReps = prev + 1;
                  onRepCount(newReps);
                  return newReps;
                });
                setStage('up');
              }
              updateFeedback('Go down');
              setIsCorrect(true);
            } else if (angle < 90) {
              setStage('down');
              updateFeedback('Go up');
              setIsCorrect(true);
            }
          } else if (exerciseType === 'pushup') {
            const shoulder = landmarks[12];
            const elbow = landmarks[14];
            const wrist = landmarks[16];
            const angle = calculateAngle(shoulder, elbow, wrist);

            if (angle > 160) {
              if (stage === 'down') {
                setReps((prev) => {
                  const newReps = prev + 1;
                  onRepCount(newReps);
                  return newReps;
                });
                setStage('up');
              }
              updateFeedback('Lower your body');
              setIsCorrect(true);
            } else if (angle < 90) {
              setStage('down');
              updateFeedback('Push up');
              setIsCorrect(true);
            }
          } else if (exerciseType === 'jumping_jack') {
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];
            const leftAnkle = landmarks[27];
            const rightAnkle = landmarks[28];
            
            const wristDist = Math.abs(leftWrist.x - rightWrist.x);
            const ankleDist = Math.abs(leftAnkle.x - rightAnkle.x);

            if (wristDist > 0.5 && ankleDist > 0.3) {
              if (stage === 'up') {
                setReps((prev) => {
                  const newReps = prev + 1;
                  onRepCount(newReps);
                  return newReps;
                });
                setStage('down');
              }
              updateFeedback('Jump back in');
              setIsCorrect(true);
            } else if (wristDist < 0.2 && ankleDist < 0.15) {
              setStage('up');
              updateFeedback('Jump out!');
              setIsCorrect(true);
            }
          } else if (exerciseType === 'high_knees') {
            const leftKnee = landmarks[25];
            const rightKnee = landmarks[26];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            
            const kneeHeight = Math.min(leftKnee.y, rightKnee.y);
            const hipHeight = Math.min(leftHip.y, rightHip.y);

            if (kneeHeight < hipHeight + 0.05) {
              if (stage === 'down') {
                setReps((prev) => {
                  const newReps = prev + 1;
                  onRepCount(newReps);
                  return newReps;
                });
                setStage('up');
              }
              updateFeedback('Switch legs');
              setIsCorrect(true);
            } else {
              setStage('down');
              updateFeedback('Knees higher!');
              setIsCorrect(true);
            }
          } else if (exerciseType === 'burpee') {
            // Simplified burpee: just check for squat to pushup transition
            const hip = landmarks[24];
            const knee = landmarks[26];
            const ankle = landmarks[28];
            const squatAngle = calculateAngle(hip, knee, ankle);
            
            const shoulder = landmarks[12];
            const elbow = landmarks[14];
            const wrist = landmarks[16];
            const pushupAngle = calculateAngle(shoulder, elbow, wrist);

            if (squatAngle < 100 && pushupAngle > 150) {
              if (stage === 'up') {
                setReps((prev) => {
                  const newReps = prev + 1;
                  onRepCount(newReps);
                  return newReps;
                });
                setStage('down');
              }
              updateFeedback('Jump up!');
              setIsCorrect(true);
            } else if (squatAngle > 160) {
              setStage('up');
              updateFeedback('Drop down!');
              setIsCorrect(true);
            }
          }
        }
    }
    canvasCtx.restore();
  });

    if (videoRef.current) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser does not support camera access or it is blocked by security settings.");
        setFeedback("Camera access unsupported");
        return;
      }

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            try {
              await pose.send({ image: videoRef.current });
            } catch (err) {
              console.error("Pose detection error:", err);
            }
          }
        },
        width: 640,
        height: 480,
      });
      
      camera.start().then(() => {
        if (onReady) onReady();
      }).catch((err: any) => {
        console.error("Failed to start camera:", err);
        setCameraError(err.message || "Camera access failed");
        setFeedback("Camera not found or access denied");
        if (onReady) onReady(); // Still call onReady to hide loader
      });
    }

    return () => {
      pose.close();
    };
  }, [isActive, exerciseType, stage]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${minimal ? '' : 'aspect-video rounded-xl glow-border'}`}>
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
      
      {/* Position Guidance Overlay */}
      {isActive && positionStatus !== 'ok' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 z-10 pointer-events-none">
          <div className="p-4 bg-black/80 rounded-xl border border-red-500/50 backdrop-blur-md text-center max-w-[80%]">
            <div className="mb-2 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center animate-pulse">
                <span className="text-red-500 font-black">!</span>
              </div>
            </div>
            <p className="text-red-500 font-black uppercase text-xs tracking-widest mb-1">
              {positionStatus === 'too-close' ? 'Too Close' : 
               positionStatus === 'too-far' ? 'Too Far' : 'Out of Frame'}
            </p>
            <p className="text-white text-[10px] font-bold uppercase opacity-80">
              {positionStatus === 'too-close' ? 'Please step back for full body tracking' : 
               positionStatus === 'too-far' ? 'Please move closer to the camera' : 'Ensure your shoulders and hips are visible'}
            </p>
          </div>
          
          {/* Corner Guides */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/50" />
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center z-20">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center mb-4">
            <span className="text-red-500 font-bold text-xl">!</span>
          </div>
          <h3 className="text-white font-bold mb-2 uppercase tracking-tighter">Camera Access Error</h3>
          <p className="text-text-secondary text-xs mb-4">
            {cameraError.includes("Requested device not found") 
              ? "No camera device was detected. Please ensure your camera is connected and not being used by another app." 
              : "We couldn't access your camera. Please check your browser permissions."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent text-black text-xs font-black uppercase rounded hover:bg-accent/80 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {!minimal && (
        <>
          <div className="absolute top-4 left-4 bg-black/60 p-2 rounded-lg backdrop-blur-sm">
            <p className="text-accent font-bold uppercase text-xs">Exercise: {exerciseType.replace('_', ' ')}</p>
            <p className="text-4xl font-black glow-text">{reps}</p>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
            <p className={isCorrect ? "text-accent" : "text-red-500"}>{feedback}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PoseTracker;
