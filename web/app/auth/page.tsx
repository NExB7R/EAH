import { Suspense } from 'react'
import { headers } from 'next/headers'
import AuthForm from './auth-form'

export const metadata = {
  title: 'دخول · EAH',
}

export default async function AuthPage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <Suspense fallback={null}>
      <AuthForm nonce={nonce} />
    </Suspense>
  )
}
