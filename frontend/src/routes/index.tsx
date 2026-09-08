import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/Button'
import { useAuth } from '#/hooks/useAuth'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tight text-emerald-600">
              melo.
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-xs text-zinc-400">Loading session...</span>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {user.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isLoggingOut}
                  onClick={() => logout()}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-50">
            Melo Second-Hand Marketplace
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Give your things a second life. Buy and sell used products locally.
          </p>
        </div>

        {/* Auth Status Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAuthenticated ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            Authentication Status
          </h2>

          {isLoading ? (
            <div className="py-6 text-center text-zinc-500">
              Checking authentication session...
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-sm">
                You are currently authenticated via JWT! The backend validated
                your token at <code className="font-mono">/api/auth/me</code>.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">
                    Username
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {user.username}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">
                    Email
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {user.email}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 sm:col-span-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">
                    User ID (UUID)
                  </span>
                  <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all">
                    {user.id}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  isLoading={isLoggingOut}
                  onClick={() => logout()}
                >
                  Log Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You are currently not signed in. You can register a new account
                or sign in with existing credentials.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/login">
                  <Button variant="primary">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline">Create New Account</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
