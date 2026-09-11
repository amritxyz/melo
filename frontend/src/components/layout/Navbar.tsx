import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Heart,
  MessageSquare,
  Plus,
  User as UserIcon,
  Package,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { UserAvatar } from '#/components/avatars'
import { useAuth } from '#/hooks/useAuth'
import { useUserProfile } from '#/hooks/useUser'
import { useFavoriteIds } from '#/hooks/useFavorites'
import { useConversations } from '#/hooks/useChat'

export function Navbar() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
    isLoggingOut,
  } = useAuth()
  const { favoriteIds } = useFavoriteIds()
  const { data: conversations } = useConversations()
  const { data: profile } = useUserProfile(user?.id)
  const avatarUrl = profile?.avatar_url ?? user?.avatar_url
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    React.useState(false)

  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Total unread messages count
  const unreadMessagesCount = React.useMemo(() => {
    if (!conversations || !Array.isArray(conversations)) return 0
    return conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  }, [conversations])

  const savedCount = favoriteIds.length

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu and dropdown on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }, [currentPath])

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/'
    return currentPath.startsWith(path)
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        {/* Logo and Main Nav */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            <span className="font-bold tracking-tight text-base font-mono">
              melo
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1 py-0.2 border border-zinc-200 dark:border-zinc-800 rounded-xs">
              market
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-xs">
            <Link
              to="/products"
              className={`py-1 transition-colors ${
                isActive('/products')
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-4'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/sell"
              className={`py-1 transition-colors ${
                isActive('/sell')
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-4'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sell
            </Link>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5 text-xs">
          {authLoading ? (
            <div className="w-16 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-xs animate-pulse" />
          ) : isAuthenticated && user ? (
            <>
              {/* Saved Items */}
              <Link
                to="/favorites"
                className={`px-2 py-1 rounded-xs border transition-colors flex items-center gap-1.5 ${
                  isActive('/favorites')
                    ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="Saved Items"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Wishlist</span>
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  [{savedCount}]
                </span>
              </Link>

              {/* Messages */}
              <Link
                to="/messages"
                className={`px-2 py-1 rounded-xs border transition-colors flex items-center gap-1.5 ${
                  isActive('/messages')
                    ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="Messages"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messages</span>
                {unreadMessagesCount > 0 && (
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    [{unreadMessagesCount}]
                  </span>
                )}
              </Link>

              {/* Sell CTA */}
              <Link to="/sell">
                <Button size="sm" variant="secondary" className="gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Listing</span>
                </Button>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 py-1 px-2 rounded-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isProfileDropdownOpen}
                  aria-label="User menu"
                >
                  <UserAvatar
                    avatarUrl={avatarUrl}
                    username={user.username}
                    size="sm"
                    shape="square"
                    className="w-5 h-5 rounded-xs"
                  />
                  <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-zinc-400 transition-transform ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs py-1 z-50">
                    <div className="px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 text-[11px]">
                      <p className="text-zinc-500">Signed in as</p>
                      <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {user.username}
                      </p>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/profile/listings"
                        className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        <span>My Listings</span>
                      </Link>

                      <Link
                        to="/users/$userId"
                        params={{ userId: user.id }}
                        className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Public View</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1">
                      <button
                        type="button"
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left disabled:opacity-50 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>
                          {isLoggingOut ? 'Logging out...' : 'Log Out'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/messages"
              className="relative p-1 text-zinc-600 dark:text-zinc-400"
              aria-label="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-600 rounded-full" />
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xs focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2 text-xs">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/products"
              className={`px-2 py-1.5 rounded-xs ${
                isActive('/products')
                  ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Browse Marketplace
            </Link>

            <Link
              to="/sell"
              className={`px-2 py-1.5 rounded-xs ${
                isActive('/sell')
                  ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Post a Listing
            </Link>

            {isAuthenticated && user && (
              <>
                <Link
                  to="/favorites"
                  className="flex items-center justify-between px-2 py-1.5 rounded-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span>Wishlist</span>
                  <span className="font-mono text-zinc-500">
                    [{savedCount}]
                  </span>
                </Link>

                <Link
                  to="/messages"
                  className="flex items-center justify-between px-2 py-1.5 rounded-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span>Messages</span>
                  {unreadMessagesCount > 0 && (
                    <span className="font-mono text-emerald-600">
                      [{unreadMessagesCount}]
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="px-2 py-1.5 rounded-xs text-zinc-700 dark:text-zinc-300"
                >
                  Profile
                </Link>

                <Link
                  to="/profile/listings"
                  className="px-2 py-1.5 rounded-xs text-zinc-700 dark:text-zinc-300"
                >
                  My Listings
                </Link>

                <button
                  type="button"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="px-2 py-1.5 text-left text-red-600 dark:text-red-400 cursor-pointer"
                >
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-2 flex gap-2">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
