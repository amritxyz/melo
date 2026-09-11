import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/Button'
import { Input } from '#/components/ui/Input'
import { useAuth } from '#/hooks/useAuth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoggingIn, isAuthenticated } = useAuth()

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

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    try {
      await login({ email: email.trim(), password })
      navigate({ to: '/' })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to sign in. Please check your credentials.')
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
              login
            </span>
          </Link>
          <h2 className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Sign In to Account
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="md"
                isLoading={isLoggingIn}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs font-mono text-zinc-500">
          No account yet?{' '}
          <Link
            to="/signup"
            className="text-zinc-900 dark:text-zinc-100 underline hover:text-emerald-600"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
