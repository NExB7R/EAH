import type { Metadata } from 'next'
import AuthForm from './auth-form'

export const metadata: Metadata = {
  title: 'دخول | EAH',
  description: 'سجّل دخولك أو اعمل حساب جديد',
}

export default function AuthPage() {
  return <AuthForm />
}
