import { useEffect, useState } from 'react'
import { useAuthenticationStatus, useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'
import '../styles/auth.css'

export function AuthGate({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  if (isLoading) return <div className="auth-shell"><div className="card">Loading...</div></div>
  return isAuthenticated ? <>{children}</> : <AuthForm />
}

function AuthForm() {
  const [mode, setMode] = useState('signin')

  useEffect(() => {
    (async () => {
      const { gsap } = await import('gsap')
      gsap.from('.card', { y: 14, opacity: 0, duration: .5, ease: 'power2.out' })
      gsap.from('.field', { y: 8, opacity: 0, duration: .4, stagger: .06, delay: .1 })
    })()
  }, [mode])

  return (
    <div className="auth-shell">
      <div className="bg-orbs">
        <div className="orb one" />
        <div className="orb two" />
      </div>
      <div className="card">
        <h1 className="h1">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
        <p className="muted">{mode === 'signin' ? 'Sign in to continue your conversations.' : 'Join to start a new conversation.'}</p>
        {mode === 'signin' ? <SignIn /> : <SignUp />}
        <div className="switch">
          {mode === 'signin' ? (
            <>No account? <a onClick={() => setMode('signup')}>Sign up</a></>
          ) : (
            <>Have an account? <a onClick={() => setMode('signin')}>Sign in</a></>
          )}
        </div>
      </div>
    </div>
  )
}

function SignIn() {
  const { signInEmailPassword, isLoading, isSuccess, error } = useSignInEmailPassword()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    await signInEmailPassword(email, password)
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="field"><label className="label">Email</label><input className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="field"><label className="label">Password</label><input className="input" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <button className="btn" type="submit" disabled={isLoading}>Sign In</button>
      {isSuccess && <p className="success">Signed in!</p>}
      {error?.message && <p className="error">{error.message}</p>}
    </form>
  )
}

function SignUp() {
  const { signUpEmailPassword, isLoading, isSuccess, error } = useSignUpEmailPassword()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    await signUpEmailPassword(email, password)
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="field"><label className="label">Email</label><input className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="field"><label className="label">Password</label><input className="input" placeholder="Create a password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <button className="btn" type="submit" disabled={isLoading}>Sign Up</button>
      {isSuccess && <p className="success">Check your email to verify, then sign in.</p>}
      {error?.message && <p className="error">{error.message}</p>}
    </form>
  )
}

