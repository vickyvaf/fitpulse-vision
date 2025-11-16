# FitPulse Vision 🏋️

AI-powered workout tracker using React and TensorFlow.js for real-time pose detection and exercise form analysis.

## Features

- 🎯 **Real-time Pose Detection**: Uses TensorFlow.js MoveNet model for accurate pose tracking
- 💪 **Multiple Exercises**: Supports Lunges, Squats, Push-ups, and Jumping Jacks
- 📊 **Live Feedback**: Get instant feedback on your form and accuracy
- 🔢 **Rep Counting**: Automatic rep counting based on exercise movements
- 📈 **Performance Metrics**: View inference time and FPS in real-time
- 📹 **Example Videos**: Side-by-side comparison with correct form
- 🎨 **Modern UI**: Beautiful, responsive interface

## Getting Started

### Prerequisites

- Bun 1.0+ (required)
- Webcam access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitpulse-vision.git
cd fitpulse-vision
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Select an Exercise**: Choose from Lunges, Squats, Push-ups, or Jumping Jacks
2. **Grant Camera Access**: Allow the app to access your webcam
3. **Start Exercising**: Follow the example video and perform the exercise
4. **Get Feedback**: Monitor your accuracy and adjust your form based on real-time feedback
5. **Track Progress**: Watch your rep count increase as you complete proper reps

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Runtime**: Bun (required)
- **AI/ML**: TensorFlow.js + MoveNet Pose Detection
- **Build Tool**: Vite
- **Styling**: CSS3 with modern gradients and animations

## How It Works

1. **Pose Detection**: TensorFlow.js MoveNet model detects 17 key body points in real-time
2. **Angle Calculation**: Calculate angles between joints to determine exercise state
3. **Form Analysis**: Compare detected pose with ideal form for the specific exercise
4. **Rep Counting**: Track state transitions (up/down) to count completed repetitions
5. **Feedback Generation**: Provide actionable feedback based on form accuracy

## Exercise Analysis

### Lunges
- Tracks front knee angle (optimal: ~90°)
- Monitors body depth and torso alignment
- Detects transitions between standing and lunge positions

### Squats
- Measures knee flexion angles
- Checks squat depth (hip-to-knee distance)
- Ensures back alignment throughout movement

### Push-ups
- Monitors elbow angles (optimal: ≤90° when down)
- Verifies body alignment (straight line from head to heels)
- Tracks full range of motion

### Jumping Jacks
- Detects arm raises above head
- Measures leg spread distance
- Tracks complete movement cycles

## Performance

- **Model**: MoveNet SinglePose Lightning (fastest, optimized for real-time)
- **Inference Time**: ~15-30ms per frame
- **FPS**: 25-60 depending on hardware
- **Accuracy**: 70%+ required for proper form validation

## Browser Support

- Chrome/Edge: ✅ Recommended
- Firefox: ✅ Supported
- Safari: ✅ Supported (with WebGL)

## Future Enhancements

- [ ] Add more exercises (burpees, planks, etc.)
- [ ] Workout session history and analytics
- [ ] Custom workout programs
- [ ] Multi-user support
- [ ] Social sharing features
- [ ] Voice feedback
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- TensorFlow.js team for the amazing pose detection models
- MoveNet model for fast and accurate pose estimation
- React team for the excellent frontend framework

---

Built with ❤️ using React and TensorFlow.js

