import { createContext } from 'react'

type LogEvent = (event: string, details?: Record<string, unknown>) => void

export const LogContext = createContext<LogEvent>(() => {})
