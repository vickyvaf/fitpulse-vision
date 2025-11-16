import { Exercise } from '../App'
import './MainScreen.css'

interface MainScreenProps {
  onExerciseSelect: (exercise: Exercise) => void
}

const exercises: Exercise[] = [
  {
    id: 'lunges',
    name: 'Lunges',
    targetReps: 10,
    exampleVideoUrl: '/videos/lunges-example.mp4'
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    targetReps: 10,
    exampleVideoUrl: '/videos/pushups-example.mp4'
  },
  {
    id: 'squats',
    name: 'Squats',
    targetReps: 15,
    exampleVideoUrl: '/videos/squats-example.mp4',
    disabled: true,
    prerequisite: 'You need to complete Lunges and Push-ups perfectly'
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    targetReps: 20,
    exampleVideoUrl: '/videos/jumping-jacks-example.mp4',
    disabled: true,
    prerequisite: 'You need to complete Lunges, Push-ups, and Squats perfectly'
  }
]

function MainScreen({ onExerciseSelect }: MainScreenProps) {
  return (
    <div className="main-screen">
      <div className="main-screen-content">
        <h1 className="main-title">FitPulse Vision</h1>
        <p className="main-subtitle">Track lunges, push-ups, squats, and even jumping jacks automatically. <br />Makes your workouts more fun and way more accurate.</p>
        
        <div className="exercise-grid">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              className={`exercise-card ${exercise.disabled ? 'disabled' : ''}`}
              onClick={() => !exercise.disabled && onExerciseSelect(exercise)}
              disabled={exercise.disabled}
            >
              {exercise.disabled && <div className="lock-icon">🔒</div>}
              <div className="exercise-icon">
                <img 
                  src={getExerciseIconUrl(exercise.id)} 
                  alt={exercise.name}
                  className="exercise-icon-image"
                />
              </div>
              <h3 className="exercise-name">{exercise.name}</h3>
              <p className="exercise-reps">{exercise.targetReps} reps</p>
              {exercise.prerequisite && (
                <p className="exercise-prerequisite">{exercise.prerequisite}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getExerciseIconUrl(exerciseId: string): string {
  const icons: Record<string, string> = {
    'lunges': '/lunges-card-icon.webp',
    'squats': '/squats-card-icon.webp',
    'pushups': '/pushups-card-icon.webp',
    'jumping-jacks': '/jumping-jacks-card-icon.webp'
  }
  return icons[exerciseId] || '/lunges-card-icon.webp'
}

export default MainScreen

