import { useState } from 'react'
import MainScreen from './components/MainScreen'
import WebcamScreen from './components/WebcamScreen'
import './App.css'

export type Exercise = {
  id: string
  name: string
  targetReps: number
  exampleVideoUrl: string
  disabled?: boolean
  prerequisite?: string
}

function App() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise)
  }

  const handleBack = () => {
    setSelectedExercise(null)
  }

  return (
    <div className="App">
      {!selectedExercise ? (
        <MainScreen onExerciseSelect={handleExerciseSelect} />
      ) : (
        <WebcamScreen exercise={selectedExercise} onBack={handleBack} />
      )}
    </div>
  )
}

export default App

