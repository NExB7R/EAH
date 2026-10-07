'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Voice Search Hook (Hybrid)
// Web Speech API أولاً — Groq Whisper fallback
// ═══════════════════════════════════════════════════════════

type Status = 'idle' | 'listening' | 'processing' | 'error' | 'denied'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type VoiceSearchOptions = {
  onResult: (text: string) => void
  onError?: (error: string) => void
  onPermissionDenied?: () => void
}

// ─── فحص صلاحية المايك قبل البدء (يمنع بدء محاولة فاشلة) ───
async function checkMicPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  if (typeof navigator === 'undefined') return 'unknown'
  if (!navigator.mediaDevices || !navigator.permissions) return 'unknown'
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return result.state as 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown'
  }
}

export function useVoiceSearch({ onResult, onError, onPermissionDenied }: VoiceSearchOptions) {
  const [status, setStatus] = useState<Status>('idle')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null

    if (mediaRecorderRef.current?.state !== 'inactive') {
      try {
        mediaRecorderRef.current?.stop()
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null

    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    chunksRef.current = []
  }, [])

  // ─── Whisper fallback ───
  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType: mime })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        setStatus('processing')
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: mime })
        chunksRef.current = []

        if (blob.size < 1000) {
          setStatus('error')
          onError?.('الصوت قصير — جرب تاني')
          setTimeout(() => setStatus('idle'), 1500)
          return
        }

        try {
          const fd = new FormData()
          fd.append('audio', blob, 'voice.webm')
          const res = await fetch('/api/ai/transcribe', { method: 'POST', body: fd })
          const data = (await res.json()) as { text?: string; error?: string }
          if (data.text) {
            setStatus('idle')
            onResult(data.text)
          } else {
            setStatus('error')
            onError?.(data.error ?? 'معرفتش أفهم — جرب تاني')
            setTimeout(() => setStatus('idle'), 1500)
          }
        } catch {
          setStatus('error')
          onError?.('فشل الاتصال')
          setTimeout(() => setStatus('idle'), 1500)
        }
      }

      recorder.start()
      setStatus('listening')

      // auto-stop بعد 8 ثواني
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, 8000)
    } catch (err) {
      const name = (err as Error).name
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied')
        onPermissionDenied?.()
      } else {
        setStatus('error')
        onError?.('مش قادر أوصل للمايك')
        setTimeout(() => setStatus('idle'), 1500)
      }
    }
  }, [onResult, onError, onPermissionDenied])

  // ─── Web Speech API ───
  const start = useCallback(async () => {
    // فحص الصلاحيات قبل البدء
    const perm = await checkMicPermission()
    if (perm === 'denied') {
      setStatus('denied')
      onPermissionDenied?.()
      return
    }

    setStatus('listening')

    const SR = getSpeechRecognition()
    if (SR) {
      const recognition = new SR()
      recognition.lang = 'ar-EG'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        setStatus('idle')
        onResult(transcript)
      }

      recognition.onerror = (e) => {
        // لو الرفض صريح → ما نروحش Whisper
        const errName = (e as { error?: string } | null)?.error
        if (errName === 'not-allowed' || errName === 'service-not-allowed') {
          setStatus('denied')
          onPermissionDenied?.()
          return
        }
        // فشل تاني → Whisper
        setStatus('idle')
        void startWhisper()
      }

      recognition.onend = () => setStatus('idle')

      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch {
        // لو الـ API مش شغال → Whisper
        setStatus('idle')
        void startWhisper()
      }
      return
    }

    // مفيش Web Speech API → Whisper
    await startWhisper()
  }, [onResult, startWhisper, onPermissionDenied])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      return
    }
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices

  // cleanup على unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    status,
    isSupported,
    start,
    stop,
    isActive: status === 'listening' || status === 'processing',
  }
}
