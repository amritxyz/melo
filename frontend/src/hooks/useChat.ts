import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getConversationApi,
  getConversationsApi,
  getMessagesApi,
  markConversationReadApi,
  sendMessageApi,
  startConversationApi,
} from '#/lib/api'
import { getAccessToken } from '#/lib/auth'
import type { Message } from '#/types/chat'

export const CONVERSATIONS_QUERY_KEY = ['conversations']
export const conversationDetailQueryKey = (id: string) => ['conversation', id]
export const conversationMessagesQueryKey = (id: string) => [
  'conversation-messages',
  id,
]

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: getConversationsApi,
    refetchInterval: 10000,
  })
}

export function useConversation(id?: string) {
  return useQuery({
    queryKey: conversationDetailQueryKey(id || ''),
    queryFn: () => getConversationApi(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: conversationMessagesQueryKey(conversationId || ''),
    queryFn: () => getMessagesApi(conversationId ?? ''),
    enabled: Boolean(conversationId),
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (listingId: string) => startConversationApi(listingId),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      queryClient.setQueryData(conversationDetailQueryKey(conv.id), conv)
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) => sendMessageApi(conversationId, content),
    onSuccess: (newMsg, variables) => {
      queryClient.setQueryData<Message[]>(
        conversationMessagesQueryKey(variables.conversationId),
        (old = []) => {
          if (old.some((m) => m.id === newMsg.id)) return old
          return [...old, newMsg]
        },
      )
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) =>
      markConversationReadApi(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.setQueryData<Message[]>(
        conversationMessagesQueryKey(conversationId),
        (old = []) => old.map((m) => ({ ...m, is_read: true })),
      )
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
  })
}

export function useChatWebSocket(conversationId?: string) {
  const queryClient = useQueryClient()
  const socketRef = React.useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    if (!conversationId) return

    const token = getAccessToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/conversations/${encodeURIComponent(conversationId)}?token=${encodeURIComponent(token)}`

    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'message' && payload.data) {
          const newMsg: Message = payload.data
          queryClient.setQueryData<Message[]>(
            conversationMessagesQueryKey(conversationId),
            (old = []) => {
              if (old.some((m) => m.id === newMsg.id)) return old
              return [...old, newMsg]
            },
          )
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
        } else if (payload.type === 'read') {
          queryClient.setQueryData<Message[]>(
            conversationMessagesQueryKey(conversationId),
            (old = []) => old.map((m) => ({ ...m, is_read: true })),
          )
        }
      } catch (err) {
        console.error('WebSocket message parsing error', err)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onerror = () => {
      setIsConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [conversationId, queryClient])

  const sendWebSocketMessage = React.useCallback((content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'message',
          content,
        }),
      )
      return true
    }
    return false
  }, [])

  const sendReadReceipt = React.useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'read',
        }),
      )
    }
  }, [])

  return { isConnected, sendWebSocketMessage, sendReadReceipt }
}
