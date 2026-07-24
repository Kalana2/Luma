import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Snackbar, Alert, type AlertColor } from '@mui/material'

interface Toast {
  message: string
  severity: AlertColor
  key: number
}

interface ToastContextValue {
  toast: (message: string, severity?: AlertColor) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = useCallback((message: string, severity: AlertColor = 'error') => {
    setToast({ message, severity, key: Date.now() })
  }, [])

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <Snackbar
        key={toast?.key}
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: 24, right: 24 }}
      >
        <Alert
          severity={toast?.severity || 'error'}
          onClose={() => setToast(null)}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            alignItems: 'center',
          }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
