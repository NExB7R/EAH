import { Suspense } from 'react'
import { headers } from 'next/headers'
import AuthForm from './auth-form'

export const metadata = {
  title: 'تسجيل الدخول / إنشاء حساب',
  description: 'سجّل حساب EAH عشان تقدر تكشف الأرقام، تقيّم الأنشطة، وتطلب مباشرة.',
  robots: { index: false, follow: false },
}

export default async function AuthPage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <Suspense fallback={null}>
      <AuthForm nonce={nonce} />
    </Suspense>
  )
}
