import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/Button'
import { Input } from '#/components/ui/Input'
import { useAuth } from '#/hooks/useAuth'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { signup, isSigningUp, isAuthenticated } = useAuth()

  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      setErrorMessage('Please enter a username.')
      return
    }

    if (trimmedUsername.length < 2) {
      setErrorMessage('Username must be at least 2 characters.')
      return
    }

    if (trimmedUsername.length > 25) {
      setErrorMessage('Username must be 25 characters or fewer.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    try {
      await signup({
        username: trimmedUsername,
        email: email.trim(),
        password,
      })
      navigate({ to: '/' })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to create account. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="font-mono font-bold text-lg">melo</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1 border border-zinc-300 dark:border-zinc-700 rounded-xs">
              register
            </span>
          </Link>
          <h2 className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Create New Account
          </h2>
        </div>

        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 py-6 px-5 border border-zinc-300 dark:border-zinc-700 rounded-xs">
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-2.5 rounded-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs font-mono text-red-700 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              required
              maxLength={25}
              autoComplete="username"
              placeholder="username"
              helperText="2 to 25 characters alphanumeric."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Email address"
              type="email"
              required
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              helperText="Minimum 8 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="md"
                isLoading={isSigningUp}
              >
                Register
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs font-mono text-zinc-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-zinc-900 dark:text-zinc-100 underline hover:text-emerald-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
