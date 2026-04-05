'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  sender_id: string
  content: string
  sent_at: string
  read_at: string | null
}

export function useRealtimeChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/chat?conversationId=${conversationId}`)
    const data = await res.json()
    if (res.ok) setMessages(data.messages || [])
    setIsLoading(false)
  }, [conversationId])

  useEffect(() => {
    loadMessages()

    let channel: RealtimeChannel

    channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, loadMessages, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, conversationId }),
      })
      return res.ok
    },
    [conversationId]
  )

  return { messages, isLoading, sendMessage }
}
