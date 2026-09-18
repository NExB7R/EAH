'use client'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { id: number; msg: string; kind: 'info' | 'success' | 'error' }
type Ctx = { push: (msg: string, kind?: Toast['kind']) => void }

const ToastCtx = createContext<Ctx>({ push: () => {} })

export function useToast() { return useContext(ToastCtx) }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((msg: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, msg, kind }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const close = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {toasts.length > 0 && (
        <div className="e-toast-wrap" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`e-toast e-toast--${t.kind}`}>
              <span className="e-toast__dot" />
              <span className="e-toast__msg">{t.msg}</span>
              <button type="button" className="e-toast__close" onClick={() => close(t.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
