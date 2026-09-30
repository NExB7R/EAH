import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import AuthForm from './auth-form'

export const metadata: Metadata = {
  title: 'دخول | EAH',
  description: 'سجّل دخولك أو اعمل حساب جديد',
}

export default async function AuthPage() {
  const session = await getUserSession()
  if (session) redirect('/')

  return <AuthForm />
}
