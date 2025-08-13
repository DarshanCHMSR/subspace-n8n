import { useState } from 'react'
import { useAuthenticationStatus, useEmailPasswordSignIn, useEmailPasswordSignUp } from '@nhost/react'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  if (isLoading) return <div>Loading...</div>
  return isAuthenticated ? <>{children}</> : <AuthForm />
}

function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  return (
    <div style={{ maxWidth: 360, margin: '4rem auto' }}>
      <h2>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
      {mode === 'signin' ? <SignIn /> : <SignUp />}
      <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ marginTop: 12 }}>
        {mode === 'signin' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
      </button>
    </div>
  )
}

function SignIn() {
  const { signInEmailPassword, isLoading, isSuccess, error } = useEmailPasswordSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signInEmailPassword(email, password)
  }
  return (
    <form onSubmit={onSubmit}>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" disabled={isLoading}>Sign In</button>
      {isSuccess && <p>Signed in!</p>}
      {error?.message && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  )
}

function SignUp() {
  const { signUpEmailPassword, isLoading, isSuccess, error } = useEmailPasswordSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signUpEmailPassword(email, password)
  }
  return (
    <form onSubmit={onSubmit}>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" disabled={isLoading}>Sign Up</button>
      {isSuccess && <p>Check your email to verify, then sign in.</p>}
      {error?.message && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  )
}

