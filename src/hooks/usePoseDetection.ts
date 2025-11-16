import { useEffect, useRef, useState, useCallback } from 'react'
// @ts-ignore
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'
import { analyzePose, ExerciseType } from '../utils/poseAnalysis'

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  exerciseType: string,
  onRepComplete: (reps: number) => void
) {
  const [isModelReady, setIsModelReady] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [inferenceTime, setInferenceTime] = useState(0)
  const [fps, setFps] = useState(0)

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null)
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(0)
  const fpsTimesRef = useRef<number[]>([])
  
  const repCountRef = useRef(0)
  const isDownRef = useRef(false)
  const lastStateRef = useRef<'up' | 'down'>('up')
  const stateConfidenceRef = useRef(0)
  const minAccuracyForCountRef = useRef(60)
  const currentAccuracyRef = useRef(0)

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready()
        await tf.setBackend('webgl')

        const model = poseDetection.SupportedModels.MoveNet
        const detectorConfig: any = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        }

        const detector = await poseDetection.createDetector(model, detectorConfig)
        detectorRef.current = detector
        setIsModelReady(true)
        console.log('Pose detection model loaded successfully')
      } catch (error) {
        console.error('Error loading pose detection model:', error)
      }
    }

    loadModel()

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose()
      }
    }
  }, [])

  const detect = useCallback(async () => {
    if (
      !detectorRef.current ||
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.readyState !== 4
    ) {
      animationFrameRef.current = requestAnimationFrame(detect)
      return
    }

    const startTime = performance.now()
    const video = videoRef.current
    const canvas = canvasRef.current

    try {
      const poses = await detectorRef.current.estimatePoses(video)

      const endTime = performance.now()
      const inferenceMs = endTime - startTime
      setInferenceTime(inferenceMs)

      const timeSinceLastFrame = endTime - lastFrameTimeRef.current
      if (timeSinceLastFrame > 0) {
        fpsTimesRef.current.push(1000 / timeSinceLastFrame)
        if (fpsTimesRef.current.length > 10) {
          fpsTimesRef.current.shift()
        }
        const avgFps = fpsTimesRef.current.reduce((a, b) => a + b, 0) / fpsTimesRef.current.length
        setFps(avgFps)
      }
      lastFrameTimeRef.current = endTime

      if (poses.length > 0) {
        const pose = poses[0]
        
        drawPose(pose, canvas)

        const analysis = analyzePose(pose, exerciseType as ExerciseType)
        currentAccuracyRef.current = analysis.accuracy
        setFeedback(analysis.feedback)

        const repCounted = countRep(analysis.state, analysis.accuracy)
        if (repCounted) {
          repCountRef.current += 1
          onRepComplete(repCountRef.current)
        }

        if (analysis.state === 'up') {
          setAccuracy(analysis.accuracy)
        }
      } else {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        setAccuracy(0)
        setFeedback('No person detected')
      }
    } catch (error) {
      console.error('Error during pose detection:', error)
    }

    animationFrameRef.current = requestAnimationFrame(detect)
  }, [videoRef, canvasRef, exerciseType, onRepComplete])

  const countRep = (currentState: 'up' | 'down', accuracy: number): boolean => {
    const minConfidenceFrames = 3
    
    if (currentState === lastStateRef.current) {
      stateConfidenceRef.current = Math.min(stateConfidenceRef.current + 1, minConfidenceFrames)
    } else {
      stateConfidenceRef.current = 0
    }
    
    if (stateConfidenceRef.current < minConfidenceFrames) {
      return false
    }
    
    if (lastStateRef.current === 'up' && currentState === 'down') {
      isDownRef.current = true
      lastStateRef.current = 'down'
      stateConfidenceRef.current = 0
      return false
    }
    
    if (lastStateRef.current === 'down' && currentState === 'up' && isDownRef.current) {
      if (accuracy >= minAccuracyForCountRef.current) {
        isDownRef.current = false
        lastStateRef.current = 'up'
        stateConfidenceRef.current = 0
        return true
      } else {
        isDownRef.current = false
        lastStateRef.current = 'up'
        stateConfidenceRef.current = 0
        return false
      }
    }

    return false
  }

  const drawPose = (pose: poseDetection.Pose, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx || !videoRef.current) return

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (pose.keypoints) {
      pose.keypoints.forEach((keypoint: any) => {
        if (keypoint.score && keypoint.score > 0.3) {
          ctx.beginPath()
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = '#00ff00'
          ctx.fill()
        }
      })

      const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle'],
      ]

      connections.forEach(([start, end]) => {
        const startPoint = pose.keypoints.find((kp: any) => kp.name === start)
        const endPoint = pose.keypoints.find((kp: any) => kp.name === end)

        if (
          startPoint &&
          endPoint &&
          startPoint.score &&
          endPoint.score &&
          startPoint.score > 0.3 &&
          endPoint.score > 0.3
        ) {
          ctx.beginPath()
          ctx.moveTo(startPoint.x, startPoint.y)
          ctx.lineTo(endPoint.x, endPoint.y)
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    }
  }

  const startDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(detect)
  }, [detect])

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return {
    accuracy,
    feedback,
    inferenceTime,
    fps,
    isModelReady,
    startDetection,
    stopDetection
  }
}

