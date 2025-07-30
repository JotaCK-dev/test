import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Loader } from 'lucide-react'
import { useMessages } from '../../hooks/useMessages'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'

const GLOBAL_CHAT_ID = '00000000-0000-0000-0000-000000000001'

export const GlobalChat: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    copyMessage
  } = useMessages(GLOBAL_CHAT_ID)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-8 h-8 text-red-primary animate-spin mx-auto mb-3" />
          <p className="text-white text-lg">Cargando chat global...</p>
          <p className="text-dark-500 text-sm">Conectando con otros usuarios</p>
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
            <div className="bg-red-primary/20 p-2 rounded-xl">
              <Users className="w-6 h-6 text-red-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chat Global</h1>
              <p className="text-dark-500 text-sm">
                Conecta con todos los usuarios de RyVen Chat
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">En línea</span>
          </div>
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="bg-dark-200 rounded-2xl p-8 max-w-md">
              <div className="bg-red-primary/20 p-4 rounded-full w-fit mx-auto mb-4">
                <Users className="w-12 h-12 text-red-primary" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                ¡Bienvenido al Chat Global!
              </h3>
              <p className="text-dark-500 mb-4">
                Este es el espacio donde todos los usuarios de RyVen Chat pueden
                conversar en tiempo real. ¡Sé el primero en enviar un mensaje!
              </p>
              <div className="text-xs text-dark-500 space-y-1">
                <p>💬 Comparte mensajes e imágenes</p>
                <p>⚡ Actualizaciones en tiempo real</p>
                <p>✨ Conecta con la comunidad</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                onEdit={editMessage}
                onDelete={deleteMessage}
                onCopy={copyMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={sendMessage}
        placeholder="Envía un mensaje al chat global..."
      />
    </div>
  )
}