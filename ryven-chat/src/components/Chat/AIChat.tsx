import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Users, Loader, UserPlus, UserMinus } from 'lucide-react'
import { useAIMessages } from '../../hooks/useAIMessages'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { Chat, ChatParticipant } from '../../config/supabase'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface AIChatProps {
  chat: Chat
}

export const AIChat: React.FC<AIChatProps> = ({ chat }) => {
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [isParticipant, setIsParticipant] = useState(false)
  
  const {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    copyMessage,
    joinChat,
    leaveChat,
    isAITyping
  } = useAIMessages(chat.id)

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          *,
          profiles (
            id,
            email
          )
        `)
        .eq('chat_id', chat.id)

      if (!error && data) {
        setParticipants(data)
        setIsParticipant(data.some(p => p.user_id === user?.id))
      }
    }

    fetchParticipants()

    // Subscribe to participant changes
    const channel = supabase
      .channel(`participants:${chat.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
          filter: `chat_id=eq.${chat.id}`
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chat.id, user?.id])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAITyping])

  const handleJoinChat = async () => {
    const { error } = await joinChat()
    if (!error) {
      setIsParticipant(true)
    }
  }

  const handleLeaveChat = async () => {
    const { error } = await leaveChat()
    if (!error) {
      setIsParticipant(false)
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-8 h-8 text-red-primary animate-spin mx-auto mb-3" />
          <p className="text-white text-lg">Cargando chat con IA...</p>
          <p className="text-dark-500 text-sm">Preparando RyVen AI</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-dark-200 rounded-2xl p-8 border border-red-primary/30"
        >
          <p className="text-red-primary text-lg mb-2">Error al cargar el chat</p>
          <p className="text-dark-500 text-sm">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-dark-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-200 border-b border-dark-300 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-2 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{chat.name}</h1>
              <p className="text-dark-500 text-sm flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {participants.length} participante{participants.length !== 1 ? 's' : ''}
                {isAITyping && (
                  <span className="ml-2 text-purple-400 animate-pulse">
                    RyVen AI está escribiendo...
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Participant avatars */}
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="w-8 h-8 bg-red-primary rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-dark-200"
                  title={participant.profiles?.email}
                >
                  {participant.profiles?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-8 h-8 bg-dark-400 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-dark-200">
                  +{participants.length - 3}
                </div>
              )}
            </div>

            {/* Join/Leave button */}
            {isParticipant ? (
              <button
                onClick={handleLeaveChat}
                className="flex items-center space-x-2 bg-red-primary/20 hover:bg-red-primary/30 text-red-primary px-3 py-2 rounded-lg transition-colors"
              >
                <UserMinus className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </button>
            ) : (
              <button
                onClick={handleJoinChat}
                className="flex items-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-3 py-2 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Unirse</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {!isParticipant ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="bg-dark-200 rounded-2xl p-8 max-w-md">
              <div className="bg-purple-600/20 p-4 rounded-full w-fit mx-auto mb-4">
                <Bot className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Chat con IA: {chat.name}
              </h3>
              <p className="text-dark-500 mb-4">
                Únete a este chat para conversar con RyVen AI junto con otros usuarios.
                La IA conocerá a todos los participantes y podrá mantener conversaciones
                contextuales con múltiples personas.
              </p>
              <button
                onClick={handleJoinChat}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
              >
                Unirse al Chat
              </button>
            </div>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="bg-dark-200 rounded-2xl p-8 max-w-md">
              <div className="bg-purple-600/20 p-4 rounded-full w-fit mx-auto mb-4">
                <Bot className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                ¡Bienvenido al Chat con IA!
              </h3>
              <p className="text-dark-500 mb-4">
                Conversa con RyVen AI. La inteligencia artificial conoce a todos los
                participantes y puede analizar imágenes. ¡Haz tu primera pregunta!
              </p>
              <div className="text-xs text-dark-500 space-y-1">
                <p>🤖 Respuestas inteligentes y contextuales</p>
                <p>👁️ Análisis de imágenes</p>
                <p>👥 Conversaciones grupales</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onEdit={editMessage}
                onDelete={deleteMessage}
                onCopy={copyMessage}
              />
            ))}
            
            {/* AI typing indicator */}
            <AnimatePresence>
              {isAITyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start mb-4"
                >
                  <div className="max-w-xs md:max-w-md lg:max-w-lg">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl px-4 py-3">
                      <div className="flex items-center mb-2 text-xs opacity-70">
                        <Bot className="w-3 h-3 mr-1" />
                        <span>RyVen AI</span>
                      </div>
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input - only show if user is participant */}
      {isParticipant && (
        <MessageInput
          onSendMessage={sendMessage}
          placeholder="Pregúntale algo a RyVen AI..."
          disabled={isAITyping}
        />
      )}
    </div>
  )
}