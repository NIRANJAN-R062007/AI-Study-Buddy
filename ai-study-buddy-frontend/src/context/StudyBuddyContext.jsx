import React, { createContext, useContext, useReducer, useEffect } from 'react'

const StudyBuddyContext = createContext()

const initialState = {
  userProfile: {
    learningStyle: 'visual',
    preferredTopics: ['python', 'javascript'],
    difficultyLevel: 'intermediate',
    studyGoals: ['Learn React', 'Master Data Structures'],
    name: 'Student'
  },
  studySessions: [
    {
      id: 'session-1',
      topic: 'Python',
      duration: 45,
      materialsCovered: ['Functions', 'Classes'],
      questionsAsked: 3,
      confidenceLevel: 7,
      startTime: '2024-01-15T10:00:00',
      endTime: '2024-01-15T10:45:00'
    }
  ],
  currentSession: null,
  progress: {
    totalStudyTime: 45,
    sessionsCompleted: 1,
    questionsAsked: 3,
    averageConfidence: 7
  },
  studyPlans: []
}

function studyBuddyReducer(state, action) {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        currentSession: {
          id: Date.now().toString(),
          topic: action.payload.topic,
          startTime: new Date().toISOString(),
          questionsAsked: 0,
          materialsCovered: []
        }
      }
    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
        studySessions: [...state.studySessions, action.payload],
        progress: {
          totalStudyTime: state.progress.totalStudyTime + action.payload.duration,
          sessionsCompleted: state.progress.sessionsCompleted + 1,
          questionsAsked: state.progress.questionsAsked + action.payload.questionsAsked,
          averageConfidence: ((state.progress.averageConfidence * state.progress.sessionsCompleted) + action.payload.confidenceLevel) / (state.progress.sessionsCompleted + 1)
        }
      }
    case 'SET_STUDY_PLANS':
      return {
        ...state,
        studyPlans: action.payload
      }
    case 'ADD_STUDY_PLAN':
      return {
        ...state,
        studyPlans: [...state.studyPlans, action.payload]
      }
    case 'DELETE_STUDY_PLAN':
      return {
        ...state,
        studyPlans: state.studyPlans.filter(plan => plan.id !== action.payload)
      }
    default:
      return state
  }
}

export function StudyBuddyProvider({ children }) {
  const [state, dispatch] = useReducer(studyBuddyReducer, initialState)

  return (
    <StudyBuddyContext.Provider value={{ state, dispatch }}>
      {children}
    </StudyBuddyContext.Provider>
  )
}

export const useStudyBuddy = () => {
  const context = useContext(StudyBuddyContext)
  if (!context) {
    throw new Error('useStudyBuddy must be used within a StudyBuddyProvider')
  }
  return context
}
