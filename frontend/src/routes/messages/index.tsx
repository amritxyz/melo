import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  Package,
  Send,
  User as UserIcon,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { StatusBadge } from '#/components/ui/Badge'
import { Navbar } from '#/components/layout/Navbar'
import { useAuth } from '#/hooks/useAuth'
import {
  useChatWebSocket,
  useConversation,
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '#/hooks/useChat'
import type { Conversation, Message } from '#/types/chat'

interface MessagesSearch {
  conversationId?: string
}

export const Route = createFileRoute('/messages/')({
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    conversationId:
      typeof search.conversationId === 'string'
        ? search.conversationId
        : undefined,
  }),
  component: MessagesPage,
})

function MessagesPage() {
  const { conversationId: selectedConvId } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const { data: conversations = [], isLoading: loadingConversations } =
    useConversations()
  const { data: currentConv } = useConversation(selectedConvId)
  const { data: messages = [], isLoading: loadingMessages } =
    useMessages(selectedConvId)

  const sendMessageMutation = useSendMessage()
  const markReadMutation = useMarkConversationRead()

  const [inputContent, setInputContent] = React.useState('')
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null)

  const { isConnected, sendWebSocketMessage, sendReadReceipt } =
    useChatWebSocket(selectedConvId)

  // Scroll to bottom whenever messages update
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark as read when entering a conversation
  React.useEffect(() => {
    if (selectedConvId && currentConv && user) {
      markReadMutation.mutate(selectedConvId)
      sendReadReceipt()
    }
  }, [selectedConvId, currentConv?.id, user?.id])

  const handleSelectConversation = (id: string) => {
    navigate({
      search: { conversationId: id },
    })
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const content = inputContent.trim()
    if (!content || !selectedConvId) return

    setInputContent('')

    // Try sending over websocket first for instant delivery, or fallback to REST mutation
    const sentViaWs = sendWebSocketMessage(content)
    if (!sentViaWs) {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConvId,
        content,
      })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <MessageSquare className="w-12 h-12 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign In to View Messages
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Please log in to contact sellers and view your chat history.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const otherParticipant =
    currentConv?.buyer_id === user.id ? currentConv.seller : currentConv?.buyer

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <Navbar />

      {/* Main Container: Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 ${
            selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-base font-bold">Conversations</h2>
            <span className="text-xs text-zinc-500 font-medium">
              {conversations.length} active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {loadingConversations ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-semibold mb-1">No chats yet</p>
                <p className="text-xs text-zinc-500 mb-4">
                  Find an item on the marketplace and message the seller to
                  start chatting.
                </p>
                <Link to="/products">
                  <Button size="sm" variant="outline">
                    Browse Listings
                  </Button>
                </Link>
              </div>
            ) : (
              conversations.map((conv: Conversation) => {
                const isSelected = conv.id === selectedConvId
                const partner =
                  conv.buyer_id === user.id ? conv.seller : conv.buyer
                const isSellerOfItem = conv.seller_id === user.id
                const hasUnread = (conv.unread_count || 0) > 0

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0 font-bold text-sm">
                      {partner ? (
                        partner.username[0].toUpperCase()
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold truncate">
                          {partner?.username || 'User'}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {conv.updated_at
                            ? new Date(conv.updated_at).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' },
                              )
                            : ''}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate mb-1">
                        {isSellerOfItem ? 'Selling: ' : 'Buying: '}
                        {conv.listing?.title || 'Item'}
                      </p>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {conv.last_message?.content || 'No messages yet'}
                      </p>
                    </div>

                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 ${
            selectedConvId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConvId && currentConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectConversation('')}
                    className="md:hidden p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                    {otherParticipant ? (
                      otherParticipant.username[0].toUpperCase()
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {otherParticipant?.username || 'Chat Participant'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Wifi className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 font-medium">
                          <WifiOff className="w-3 h-3" /> Offline sync
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Listing Snapshot Pill */}
                {currentConv.listing && (
                  <Link
                    to="/products/$listingId"
                    params={{ listingId: currentConv.listing.id }}
                    className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 transition-colors"
                  >
                    <Package className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div className="text-right">
                      <span className="block text-xs font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                        {currentConv.listing.title}
                      </span>
                      <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('en-NP', {
                          style: 'currency',
                          currency: 'NPR',
                          maximumFractionDigits: 0,
                        }).format(currentConv.listing.price)}
                      </span>
                    </div>
                    <StatusBadge status={currentConv.listing.status} />
                  </Link>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {loadingMessages ? (
                  <div className="text-center py-8 text-xs text-zinc-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xs text-zinc-400">
                      Say hello! Ask questions about condition, pickup location,
                      or pricing.
                    </p>
                  </div>
                ) : (
                  messages.map((msg: Message) => {
                    const isMine = msg.sender_id === user.id
                    const formattedTime = new Date(
                      msg.created_at,
                    ).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                            isMine
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/60 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMine ? 'text-emerald-100' : 'text-zinc-400'
                            }`}
                          >
                            <span>{formattedTime}</span>
                            {isMine &&
                              (msg.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                              ) : (
                                <Check className="w-3 h-3 text-emerald-200" />
                              ))}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 max-w-4xl mx-auto"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    className="flex-1 h-11 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    disabled={
                      !inputContent.trim() || sendMessageMutation.isPending
                    }
                    className="h-11 px-4 gap-1.5 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold mb-1">Your Marketplace Chats</h3>
              <p className="text-xs text-zinc-500 max-w-xs mb-4">
                Select an active conversation on the left to view messages and
                contact sellers in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
