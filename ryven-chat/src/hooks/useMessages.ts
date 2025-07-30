import { useState, useEffect, useCallback } from 'react'
import { supabase, Message } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (
            id,
            email
          )
        `)
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        setError('Error al cargar mensajes')
        return
      }

      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }, [chatId])

  // Send message
  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!user || (!content.trim() && !imageUrl)) return { error: 'Mensaje vacío' }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content: content.trim() || null,
          image_url: imageUrl || null,
          is_ai: false
        })

      return { error }
    } catch (err) {
      console.error('Error sending message:', err)
      return { error: 'Error al enviar mensaje' }
    }
  }, [user, chatId])

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return { error: 'Contenido vacío' }

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id)

      return { error }
    } catch (err) {
      console.error('Error editing message:', err)
      return { error: 'Error al editar mensaje' }
    }
  }, [user])

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return { error: 'Usuario no autenticado' }

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          content: null,
          image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id)

      return { error }
    } catch (err) {
      console.error('Error deleting message:', err)
      return { error: 'Error al eliminar mensaje' }
    }
  }, [user])

  // Copy message content
  const copyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      return { success: true }
    } catch (err) {
      console.error('Error copying message:', err)
      return { error: 'Error al copiar mensaje' }
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new message with profile data
            const { data } = await supabase
              .from('messages')
              .select(`
                *,
                profiles (
                  id,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (data && !data.is_deleted) {
              setMessages(prev => [...prev, data])
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated message with profile data
            const { data } = await supabase
              .from('messages')
              .select(`
                *,
                profiles (
                  id,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (data) {
              setMessages(prev => 
                data.is_deleted 
                  ? prev.filter(msg => msg.id !== data.id)
                  : prev.map(msg => msg.id === data.id ? data : msg)
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, fetchMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    copyMessage,
    refetch: fetchMessages
  }
}