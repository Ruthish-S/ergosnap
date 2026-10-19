import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Assessment, AssessmentSession } from '../types/assessment';

type Action =
  | { type: 'ADD_ASSESSMENT'; payload: Assessment }
  | { type: 'UPDATE_ASSESSMENT'; payload: Assessment }
  | { type: 'REMOVE_ASSESSMENT'; payload: string }
  | { type: 'SET_CURRENT_ASSESSMENT'; payload: string }
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_VALIDATION_MODE'; payload: boolean }
  | { type: 'RESET_SESSION' };

interface ExtendedSession extends AssessmentSession {
  currentAssessmentId: string | null;
}

const STORAGE_KEY = 'ergosnap_session_v1';

function createInitialSession(): ExtendedSession {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        currentAssessmentId: parsed.assessments[0]?.assessmentId || null,
      };
    }
  } catch {
    // Fall back to clean state
  }

  return {
    sessionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    assessments: [],
    isDemoMode: false,
    isValidationMode: false,
    currentAssessmentId: null,
  };
}

function sessionReducer(state: ExtendedSession, action: Action): ExtendedSession {
  let newState: ExtendedSession;

  switch (action.type) {
    case 'ADD_ASSESSMENT':
      newState = {
        ...state,
        assessments: [action.payload, ...state.assessments],
        currentAssessmentId: action.payload.assessmentId,
      };
      break;

    case 'UPDATE_ASSESSMENT':
      newState = {
        ...state,
        assessments: state.assessments.map((a) =>
          a.assessmentId === action.payload.assessmentId ? action.payload : a
        ),
      };
      break;

    case 'REMOVE_ASSESSMENT':
      newState = {
        ...state,
        assessments: state.assessments.filter((a) => a.assessmentId !== action.payload),
        currentAssessmentId:
          state.currentAssessmentId === action.payload
            ? state.assessments.find((a) => a.assessmentId !== action.payload)?.assessmentId || null
            : state.currentAssessmentId,
      };
      break;

    case 'SET_CURRENT_ASSESSMENT':
      newState = {
        ...state,
        currentAssessmentId: action.payload,
      };
      break;

    case 'SET_DEMO_MODE':
      newState = {
        ...state,
        isDemoMode: action.payload,
      };
      break;

    case 'SET_VALIDATION_MODE':
      newState = {
        ...state,
        isValidationMode: action.payload,
      };
      break;

    case 'RESET_SESSION':
      newState = {
        sessionId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        assessments: [],
        isDemoMode: false,
        isValidationMode: false,
        currentAssessmentId: null,
      };
      break;

    default:
      return state;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch {
    // Ignore storage quota errors
  }

  return newState;
}

const AssessmentContext = createContext<{
  session: ExtendedSession;
  dispatch: React.Dispatch<Action>;
  currentAssessment: Assessment | null;
} | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(sessionReducer, null, createInitialSession);

  const currentAssessment =
    session.assessments.find((a) => a.assessmentId === session.currentAssessmentId) ??
    session.assessments[0] ??
    null;

  return (
    <AssessmentContext.Provider value={{ session, dispatch, currentAssessment }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return ctx;
}
