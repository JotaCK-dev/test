import { useState, useCallback } from 'react'
import { useMessages } from './useMessages'
import { supabase } from '../config/supabase'
import { geminiService } from '../services/geminiService'
import { useAuth } from '../contexts/AuthContext'

export const useAIMessages = (chatId: string) => {
  const { user } = useAuth()
  const [isAITyping, setIsAITyping] = useState(false)
  
  const messagesHook = useMessages(chatId)
  const { messages, sendMessage: baseSendMessage, ...rest } = messagesHook

  // Enhanced send message that triggers AI response
  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return { error: 'Mensaje vacío' }

    // Send user message first
    const { error } = await baseSendMessage(content, imageUrl)
    if (error) return { error }

    // Trigger AI response
    setIsAITyping(true)
    
    try {
      // Build context for AI
      const context = geminiService.buildConversationContext(messages)
      const participants = geminiService.extractParticipants(messages)
      
      let aiResponse
      
      if (imageUrl) {
        // If there's an image, use vision model
        aiResponse = await geminiService.generateImageResponse(
          imageUrl,
          content,
          participants
        )
      } else {
        // Regular text response
        aiResponse = await geminiService.generateResponse(
          content,
          context,
          participants
        )
      }

      // Send AI response
      if (aiResponse.content) {
        // Add a small delay to make it feel more natural
        setTimeout(async () => {
          await supabase
            .from('messages')
            .insert({
              chat_id: chatId,
              user_id: null, // AI messages don't have a user_id
              content: aiResponse.error || aiResponse.content,
              is_ai: true,
              ai_participants: participants
            })
        }, 1000)
      }
      
    } catch (err) {
      console.error('Error generating AI response:', err)
      // Send error message as AI response
      setTimeout(async () => {
        await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            user_id: null,
            content: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.',
            is_ai: true,
            ai_participants: geminiService.extractParticipants(messages)
          })
      }, 1000)
    } finally {
      setTimeout(() => setIsAITyping(false), 1500)
    }

    return { error: null }
  }, [baseSendMessage, messages, chatId])

  // Join chat (add user as participant)
  const joinChat = useCallback(async () => {
    if (!user) return { error: 'Usuario no autenticado' }

    try {
      const { error } = await supabase
        .from('chat_participants')
        .insert({
          chat_id: chatId,
          user_id: user.id
        })

      return { error }
    } catch (err) {
      console.error('Error joining chat:', err)
      return { error: 'Error al unirse al chat' }
    }
  }, [user, chatId])

  // Leave chat (remove user as participant)
  const leaveChat = useCallback(async () => {
    if (!user) return { error: 'Usuario no autenticado' }

    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', user.id)

      return { error }
    } catch (err) {
      console.error('Error leaving chat:', err)
      return { error: 'Error al salir del chat' }
    }
  }, [user, chatId])

  return {
    ...rest,
    messages,
    sendMessage,
    joinChat,
    leaveChat,
    isAITyping
  }
}