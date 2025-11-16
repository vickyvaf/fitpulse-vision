import { useEffect, useRef, useState } from 'react'
import { Exercise } from '../App'
import { usePoseDetection } from '../hooks/usePoseDetection'
import './WebcamScreen.css'

interface WebcamScreenProps {
  exercise: Exercise
  onBack: () => void
}

function WebcamScreen({ exercise, onBack }: WebcamScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exampleVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isWebcamReady, setIsWebcamReady] = useState(false)
  const [currentReps, setCurrentReps] = useState(0)
  
  const {
    accuracy,
    feedback,
    inferenceTime,
    fps,
    isModelReady,
    startDetection,
    stopDetection
  } = usePoseDetection(videoRef, canvasRef, exercise.id, (reps) => {
    setCurrentReps(reps)
  })

  // Initialize webcam
  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setIsWebcamReady(true)
          }
        }
      } catch (error) {
        console.error('Error accessing webcam:', error)
        alert('Unable to access webcam. Please grant camera permissions.')
      }
    }

    setupWebcam()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      stopDetection()
    }
  }, [stopDetection])

  // Start pose detection when ready
  useEffect(() => {
    if (isWebcamReady && isModelReady) {
      startDetection()
    }
  }, [isWebcamReady, isModelReady, startDetection])

  // Loop example video when model is ready
  useEffect(() => {
    const video = exampleVideoRef.current
    if (video && isModelReady) {
      video.loop = true
      video.play().catch(e => console.log('Autoplay prevented:', e))
    }
  }, [isModelReady])

  const repsLeft = Math.max(0, exercise.targetReps - currentReps)
  const isComplete = currentReps >= exercise.targetReps

  return (
    <div className="webcam-screen">
      {/* Back button - show only when model is ready */}
      {isModelReady && (
        <button className="back-button" onClick={onBack}>
          ← Back to Homepage
        </button>
      )}

      <div className="webcam-container">
        {/* Example video - top left (show only when model is ready) */}
        {isModelReady && (
          <div className="example-video-container">
            <video
              ref={exampleVideoRef}
              className="example-video"
              src={exercise.exampleVideoUrl}
              muted
              playsInline
              preload="auto"
              onError={(e) => console.error('Video failed to load:', e)}
            />
            <div className="example-label">Example</div>
          </div>
        )}

        {/* Reps counter - top right (show only when model is ready) */}
        {isModelReady && (
          <div className="reps-container">
            <div className="reps-label">Reps Left</div>
            <div className={`reps-count ${isComplete ? 'complete' : ''}`}>
              {isComplete ? '✓' : repsLeft}
            </div>
          </div>
        )}

        {/* Main webcam view */}
        <div className="video-wrapper">
          <video
            ref={videoRef}
            className="webcam-video"
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="pose-canvas"
          />
          {!isModelReady && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading AI Model...</p>
            </div>
          )}
        </div>

        {/* Stats bar - bottom */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-label">Accuracy</div>
            <div className={`stat-value accuracy ${accuracy >= 70 ? 'good' : 'poor'}`}>
              {accuracy.toFixed(0)}%
            </div>
          </div>

          <div className="stat-item feedback-item">
            <div className="stat-label">Feedback</div>
            <div className="stat-value feedback-text">
              {feedback || 'Start exercising...'}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Inference</div>
            <div className="stat-value">{inferenceTime.toFixed(0)}ms</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">FPS</div>
            <div className="stat-value">{fps.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="completion-overlay">
          <div className="completion-card">
            <div className="completion-icon">🎉</div>
            <h2>Great Job!</h2>
            <p>You completed {exercise.targetReps} {exercise.name}!</p>
            <button className="completion-button" onClick={onBack}>
              Choose Another Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebcamScreen

