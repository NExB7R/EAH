import { Suspense } from 'react'
import AuthForm from './auth-form'

export const metadata = {
  title: 'دخول · EAH',
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  )
}
