// TODO: Remove import when proper types/modules are available in project.
export type Pose = any
export type Keypoint = {
  x: number
  y: number
  score?: number
  name?: string
}

export type ExerciseType = 'lunges' | 'squats' | 'pushups' | 'jumping-jacks'

export interface PoseAnalysis {
  accuracy: number
  feedback: string
  state: 'up' | 'down'
}

// Helper function to calculate angle between three points
function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)
  
  if (angle > 180.0) {
    angle = 360 - angle
  }
  
  return angle
}

// Helper function to get keypoint by name
function getKeypoint(pose: Pose, name: string): Keypoint | undefined {
  return pose.keypoints.find((kp: Keypoint) => kp.name === name && kp.score && kp.score > 0.3)
}

// Analyze squats
function analyzeSquats(pose: Pose): PoseAnalysis {
  const leftHip = getKeypoint(pose, 'left_hip')
  const leftKnee = getKeypoint(pose, 'left_knee')
  const leftAnkle = getKeypoint(pose, 'left_ankle')
  const leftShoulder = getKeypoint(pose, 'left_shoulder')

  const rightHip = getKeypoint(pose, 'right_hip')
  const rightKnee = getKeypoint(pose, 'right_knee')
  const rightAnkle = getKeypoint(pose, 'right_ankle')

  if (!leftHip || !leftKnee || !leftAnkle || !leftShoulder || !rightHip || !rightKnee || !rightAnkle) {
    return {
      accuracy: 0,
      feedback: 'Unable to detect body position',
      state: 'up'
    }
  }

  // Calculate knee angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle)
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

  // Calculate hip height relative to knee
  const hipKneeDistance = Math.abs(leftHip.y - leftKnee.y)
  const kneeAnkleDistance = Math.abs(leftKnee.y - leftAnkle.y)
  const relativeHeight = hipKneeDistance / kneeAnkleDistance

  // Determine state
  const isDown = avgKneeAngle < 120 && relativeHeight < 1.2

  // Calculate accuracy
  let accuracy = 0
  let feedback = ''

  if (isDown) {
    // Check proper squat depth (knee angle should be around 90 degrees)
    const depthScore = Math.max(0, 100 - Math.abs(90 - avgKneeAngle) * 2)
    
    // Check back alignment (hip should not be too far back)
    const alignmentScore = relativeHeight > 0.8 ? 100 : relativeHeight * 125
    
    accuracy = (depthScore * 0.6 + alignmentScore * 0.4)
    
    if (accuracy < 70) {
      if (avgKneeAngle > 100) {
        feedback = 'Go deeper - squat lower'
      } else if (avgKneeAngle < 80) {
        feedback = 'Not too deep - rise slightly'
      } else {
        feedback = 'Keep your back straight'
      }
    } else {
      feedback = 'Great form! 👍'
    }
  } else {
    // Standing position
    accuracy = avgKneeAngle > 160 ? 95 : 70
    feedback = 'Ready - begin squat'
  }

  return {
    accuracy: Math.min(100, Math.max(0, accuracy)),
    feedback,
    state: isDown ? 'down' : 'up'
  }
}

// Analyze lunges
function analyzeLunges(pose: Pose): PoseAnalysis {
  const leftHip = getKeypoint(pose, 'left_hip')
  const leftKnee = getKeypoint(pose, 'left_knee')
  const leftAnkle = getKeypoint(pose, 'left_ankle')
  const rightHip = getKeypoint(pose, 'right_hip')
  const rightKnee = getKeypoint(pose, 'right_knee')
  const rightAnkle = getKeypoint(pose, 'right_ankle')

  if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
    return {
      accuracy: 0,
      feedback: 'Unable to detect body position',
      state: 'up'
    }
  }

  // Calculate knee angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle)

  // Determine which leg is forward based on knee angles
  // Use stricter threshold to avoid false positives
  const frontKneeAngle = Math.min(leftKneeAngle, rightKneeAngle)
  
  // Check depth - hip height relative to knee
  const avgHipHeight = (leftHip.y + rightHip.y) / 2
  const avgKneeHeight = (leftKnee.y + rightKnee.y) / 2
  const depth = avgKneeHeight - avgHipHeight
  
  // More strict criteria for "down" position:
  // - Front knee must be significantly bent (< 110 degrees)
  // - Must have good depth (hip lower than standing)
  // - Back knee should be more bent than standing position
  const isLunging = frontKneeAngle < 110 && depth > 30

  let accuracy = 0
  let feedback = ''

  if (isLunging) {
    // Front knee should be around 90 degrees
    const frontKneeScore = Math.max(0, 100 - Math.abs(90 - frontKneeAngle) * 2)

    // Check depth score
    const depthScore = depth > 50 ? 100 : (depth / 50) * 100

    accuracy = frontKneeScore * 0.6 + depthScore * 0.4

    if (accuracy < 70) {
      if (frontKneeAngle > 100) {
        feedback = 'Lower your body more'
      } else if (frontKneeAngle < 80) {
        feedback = 'Don\'t go too deep'
      } else {
        feedback = 'Keep your torso upright'
      }
    } else {
      feedback = 'Perfect lunge! 💪'
    }
  } else {
    // Standing position - only give high accuracy if truly standing
    const bothLegsExtended = leftKneeAngle > 150 && rightKneeAngle > 150
    accuracy = bothLegsExtended ? 85 : 60
    feedback = 'Step forward into lunge'
  }

  return {
    accuracy: Math.min(100, Math.max(0, accuracy)),
    feedback,
    state: isLunging ? 'down' : 'up'
  }
}

// Analyze push-ups
function analyzePushups(pose: Pose): PoseAnalysis {
  const leftShoulder = getKeypoint(pose, 'left_shoulder')
  const rightShoulder = getKeypoint(pose, 'right_shoulder')
  const leftElbow = getKeypoint(pose, 'left_elbow')
  const rightElbow = getKeypoint(pose, 'right_elbow')
  const leftWrist = getKeypoint(pose, 'left_wrist')
  const rightWrist = getKeypoint(pose, 'right_wrist')
  const leftHip = getKeypoint(pose, 'left_hip')
  const rightHip = getKeypoint(pose, 'right_hip')

  if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || 
      !leftWrist || !rightWrist || !leftHip || !rightHip) {
    return {
      accuracy: 0,
      feedback: 'Get into push-up position',
      state: 'up'
    }
  }

  // Calculate elbow angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist)
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2

  // Check body alignment (should be relatively straight)
  const shoulderHipDistance = Math.abs(
    ((leftShoulder.y + rightShoulder.y) / 2) - ((leftHip.y + rightHip.y) / 2)
  )

  const isDown = avgElbowAngle < 120

  let accuracy = 0
  let feedback = ''

  if (isDown) {
    // Check elbow angle (should be around 90 degrees or less)
    const elbowScore = avgElbowAngle < 100 ? 100 : Math.max(0, 100 - (avgElbowAngle - 90) * 2)
    
    // Check body alignment
    const alignmentScore = shoulderHipDistance < 80 ? 100 : Math.max(0, 100 - shoulderHipDistance)
    
    accuracy = elbowScore * 0.7 + alignmentScore * 0.3

    if (accuracy < 70) {
      if (avgElbowAngle > 110) {
        feedback = 'Lower your chest more'
      } else if (shoulderHipDistance > 80) {
        feedback = 'Keep your body straight'
      } else {
        feedback = 'Maintain alignment'
      }
    } else {
      feedback = 'Excellent push-up! 🔥'
    }
  } else {
    // Up position
    accuracy = avgElbowAngle > 160 ? 90 : 70
    feedback = 'Push back up'
  }

  return {
    accuracy: Math.min(100, Math.max(0, accuracy)),
    feedback,
    state: isDown ? 'down' : 'up'
  }
}

// Analyze jumping jacks
function analyzeJumpingJacks(pose: Pose): PoseAnalysis {
  const leftShoulder = getKeypoint(pose, 'left_shoulder')
  const rightShoulder = getKeypoint(pose, 'right_shoulder')
  const leftWrist = getKeypoint(pose, 'left_wrist')
  const rightWrist = getKeypoint(pose, 'right_wrist')
  const leftAnkle = getKeypoint(pose, 'left_ankle')
  const rightAnkle = getKeypoint(pose, 'right_ankle')
  const nose = getKeypoint(pose, 'nose')

  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist || 
      !leftAnkle || !rightAnkle || !nose) {
    return {
      accuracy: 0,
      feedback: 'Stand in view of camera',
      state: 'up'
    }
  }

  // Check if arms are up
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2
  const avgWristY = (leftWrist.y + rightWrist.y) / 2
  const armsUp = avgWristY < avgShoulderY

  // Check if legs are apart
  const legDistance = Math.abs(leftAnkle.x - rightAnkle.x)
  const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x)
  const legsApart = legDistance > shoulderDistance * 1.5

  const isJumping = armsUp && legsApart

  let accuracy = 0
  let feedback = ''

  if (isJumping) {
    // Check arm position
    const armHeightScore = avgWristY < nose.y ? 100 : Math.max(0, 100 - (avgWristY - nose.y) * 2)
    
    // Check leg separation
    const legSpreadScore = Math.min(100, (legDistance / shoulderDistance) * 40)
    
    accuracy = armHeightScore * 0.5 + legSpreadScore * 0.5

    if (accuracy < 70) {
      if (avgWristY > nose.y) {
        feedback = 'Raise your arms higher'
      } else if (legDistance < shoulderDistance * 1.5) {
        feedback = 'Spread your legs wider'
      } else {
        feedback = 'Good effort!'
      }
    } else {
      feedback = 'Great jumping jack! ⚡'
    }
  } else {
    // Resting position
    accuracy = !armsUp && !legsApart ? 85 : 60
    feedback = 'Jump with arms and legs'
  }

  return {
    accuracy: Math.min(100, Math.max(0, accuracy)),
    feedback,
    state: isJumping ? 'down' : 'up'
  }
}

// Main analysis function
export function analyzePose(pose: Pose, exerciseType: ExerciseType): PoseAnalysis {
  switch (exerciseType) {
    case 'squats':
      return analyzeSquats(pose)
    case 'lunges':
      return analyzeLunges(pose)
    case 'pushups':
      return analyzePushups(pose)
    case 'jumping-jacks':
      return analyzeJumpingJacks(pose)
    default:
      return {
        accuracy: 0,
        feedback: 'Unknown exercise type',
        state: 'up'
      }
  }
}

