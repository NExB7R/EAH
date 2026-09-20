import { Suspense } from 'react'
import AuthClient from './AuthClient'
import './auth.css'

export const metadata = {
  title: 'دخول / تسجيل',
  description: 'ادخل على EAH بسرعة — رقم موبايل وكلمة سر وخلاص',
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthClient />
    </Suspense>
  )
}
