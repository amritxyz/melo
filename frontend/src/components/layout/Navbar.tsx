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
import { useAuth } from '#/hooks/useAuth'
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
    <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Main Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-black tracking-tight text-emerald-600 transition-transform group-hover:scale-[1.02]">
              melo.
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/products"
              className={`transition-colors py-1 ${
                isActive('/products')
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Browse Marketplace
            </Link>
            <Link
              to="/sell"
              className={`transition-colors py-1 ${
                isActive('/sell')
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sell an Item
            </Link>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {authLoading ? (
            <div className="w-20 h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          ) : isAuthenticated && user ? (
            <>
              {/* Saved Items */}
              <Link
                to="/favorites"
                className={`relative p-2 rounded-lg transition-colors ${
                  isActive('/favorites')
                    ? 'text-red-500 bg-red-50/70 dark:bg-red-950/40'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Saved Items"
                aria-label="Saved items"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isActive('/favorites') || savedCount > 0
                      ? 'fill-red-500/20 text-red-500'
                      : ''
                  }`}
                />
                {savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </Link>

              {/* Messages */}
              <Link
                to="/messages"
                className={`relative p-2 rounded-lg transition-colors ${
                  isActive('/messages')
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Messages"
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </Link>

              {/* Sell CTA */}
              <Link to="/sell">
                <Button size="sm" className="gap-1.5 shadow-xs">
                  <Plus className="w-4 h-4" />
                  <span>Sell</span>
                </Button>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                  aria-expanded={isProfileDropdownOpen}
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-700/60 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-bold text-xs uppercase shadow-2xs shrink-0 aspect-square">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.username.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {user.username}
                      </p>
                      {user.email && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/profile/listings"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Package className="w-4 h-4 text-zinc-400" />
                        <span>My Listings</span>
                      </Link>

                      <Link
                        to="/users/$userId"
                        params={{ userId: user.id }}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                        <span>Public Seller View</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-1">
                      <button
                        type="button"
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left disabled:opacity-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
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
              <Link to="/sell">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Sell</span>
                </Button>
              </Link>
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

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/messages"
              className="relative p-2 text-zinc-600 dark:text-zinc-400"
              aria-label="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/products"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/products')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>Browse Marketplace</span>
            </Link>

            <Link
              to="/sell"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/sell')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>Sell an Item</span>
              <Plus className="w-4 h-4 text-zinc-400" />
            </Link>

            {isAuthenticated && user && (
              <>
                <Link
                  to="/favorites"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive('/favorites')
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Saved Items</span>
                  </div>
                  {savedCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                      {savedCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/messages"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive('/messages')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Messages</span>
                  </div>
                  {unreadMessagesCount > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                      {unreadMessagesCount} new
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Auth / Profile Section */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {authLoading ? (
              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-700/60 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-bold text-xs uppercase shrink-0 aspect-square">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.username.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {user.username}
                    </p>
                    {user.email && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/profile/listings"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <Package className="w-4 h-4 text-zinc-400" />
                    <span>My Listings</span>
                  </Link>

                  <Link
                    to="/users/$userId"
                    params={{ userId: user.id }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                    <span>Public Seller View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
