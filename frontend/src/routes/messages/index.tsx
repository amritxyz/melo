import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, CheckCheck, Send } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Navbar } from '#/components/layout/Navbar'
import { UserAvatar } from '#/components/avatars'
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
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="p-8 text-xs font-mono text-zinc-500">
          Checking authentication...
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="border border-zinc-300 dark:border-zinc-700 p-6 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 text-xs font-mono">
            <h2 className="text-sm font-bold uppercase">
              Authentication Required
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Please sign in to view your marketplace messages.
            </p>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
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

      {/* Header Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <Link
              to="/products"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              marketplace
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
              messages
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            [{conversations.length}{' '}
            {conversations.length === 1 ? 'thread' : 'threads'}]
          </span>
        </div>
      </div>

      {/* Main Container: Split View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0">
        <div className="flex-1 flex border border-zinc-200 dark:border-zinc-800 rounded-xs bg-white dark:bg-zinc-950 overflow-hidden">
          {/* Left Pane: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-88 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col shrink-0 ${
              selectedConvId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Conversations
              </span>
              <span className="text-zinc-500">[{conversations.length}]</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {loadingConversations ? (
                <div className="p-4 text-center text-xs font-mono text-zinc-500">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <p className="font-mono text-xs text-zinc-500">
                    No conversations started yet.
                  </p>
                  <Link to="/products">
                    <Button size="sm" variant="outline">
                      Browse Marketplace
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
                      className={`w-full text-left p-2.5 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-zinc-200/80 dark:bg-zinc-800 font-medium'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <UserAvatar
                        avatarUrl={(partner as any)?.avatar_url}
                        username={partner?.username}
                        size="sm"
                        shape="square"
                        className="w-6 h-6 rounded-xs border border-zinc-300 dark:border-zinc-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                            {partner?.username || 'User'}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                            {conv.updated_at
                              ? new Date(conv.updated_at).toLocaleDateString(
                                  'en-US',
                                  { month: 'numeric', day: 'numeric' },
                                )
                              : ''}
                          </span>
                        </div>

                        <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate">
                          {isSellerOfItem ? '[selling] ' : '[buying] '}
                          {conv.listing?.title || 'item'}
                        </p>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {conv.last_message?.content || 'No messages yet'}
                        </p>
                      </div>

                      {hasUnread && (
                        <span className="font-mono text-[10px] font-bold text-emerald-600 shrink-0">
                          *
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Pane: Active Chat Window */}
          <div
            className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 ${
              selectedConvId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedConvId && currentConv ? (
              <>
                {/* Chat Header */}
                <div className="p-2.5 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => handleSelectConversation('')}
                      className="md:hidden text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <UserAvatar
                      avatarUrl={(otherParticipant as any)?.avatar_url}
                      username={otherParticipant?.username}
                      size="sm"
                      shape="square"
                      className="w-5 h-5 rounded-xs border border-zinc-300 dark:border-zinc-700 shrink-0"
                    />

                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {otherParticipant?.username || 'User'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {isConnected ? '[online]' : '[sync]'}
                      </span>
                    </div>
                  </div>

                  {/* Item Reference */}
                  {currentConv.listing && (
                    <Link
                      to="/products/$listingId"
                      params={{ listingId: currentConv.listing.id }}
                      className="text-right hover:underline shrink-0 max-w-[200px]"
                    >
                      <span className="block text-[11px] truncate text-zinc-700 dark:text-zinc-300">
                        {currentConv.listing.title}
                      </span>
                      <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        NPR {currentConv.listing.price.toLocaleString()}
                      </span>
                    </Link>
                  )}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-mono">
                  {loadingMessages ? (
                    <div className="text-center py-6 text-zinc-400 text-xs">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-xs">
                      No messages in this thread. Type below to send a message.
                    </div>
                  ) : (
                    messages.map((msg: Message) => {
                      const isMine = msg.sender_id === user.id
                      const formattedTime = new Date(
                        msg.created_at,
                      ).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })

                      return (
                        <div
                          key={msg.id}
                          className={`p-2 rounded-xs border flex flex-col gap-0.5 max-w-[85%] sm:max-w-[75%] ${
                            isMine
                              ? 'ml-auto bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                              : 'mr-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-500">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {isMine
                                ? 'You'
                                : otherParticipant?.username || 'Seller'}
                            </span>
                            <span className="flex items-center gap-1">
                              {formattedTime}
                              {isMine &&
                                (msg.is_read ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Check className="w-3 h-3 text-zinc-400" />
                                ))}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 max-w-4xl mx-auto"
                  >
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      className="flex-1 h-8 px-2.5 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        !inputContent.trim() || sendMessageMutation.isPending
                      }
                      className="gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs font-mono text-zinc-500">
                <p>Select a thread from the left pane to view messages.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
