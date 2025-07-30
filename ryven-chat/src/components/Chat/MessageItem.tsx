import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Edit3, Trash2, Copy, Check, Bot } from 'lucide-react'
import { Message } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface MessageItemProps {
  message: Message
  onEdit: (messageId: string, newContent: string) => Promise<{ error?: any }>
  onDelete: (messageId: string) => Promise<{ error?: any }>
  onCopy: (content: string) => Promise<{ error?: any; success?: boolean }>
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content || '')
  const [copySuccess, setCopySuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwnMessage = user?.id === message.user_id
  const isAI = message.is_ai

  const handleEdit = async () => {
    if (!editContent.trim()) return
    
    setLoading(true)
    const { error } = await onEdit(message.id, editContent)
    
    if (!error) {
      setIsEditing(false)
      setShowMenu(false)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await onDelete(message.id)
    
    if (!error) {
      setShowMenu(false)
    }
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!message.content) return
    
    const { success } = await onCopy(message.content)
    
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
    setShowMenu(false)
  }

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs md:max-w-md lg:max-w-lg group relative ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? 'bg-red-primary text-white'
              : isAI
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
              : 'bg-dark-300 text-white'
          } ${isEditing ? 'ring-2 ring-red-primary' : ''}`}
        >
          {/* User info for non-own messages */}
          {!isOwnMessage && (
            <div className="flex items-center mb-2 text-xs opacity-70">
              {isAI && <Bot className="w-3 h-3 mr-1" />}
              <span>
                {isAI ? 'RyVen AI' : message.profiles?.email?.split('@')[0] || 'Usuario'}
              </span>
            </div>
          )}

          {/* Message content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-dark-200 text-white rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-primary"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  disabled={loading || !editContent.trim()}
                  className="bg-red-primary hover:bg-red-secondary disabled:opacity-50 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(message.content || '')
                  }}
                  className="bg-dark-400 hover:bg-dark-500 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                  {message.is_edited && (
                    <span className="text-xs opacity-60 ml-2">(editado)</span>
                  )}
                </p>
              )}
              
              {message.image_url && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={message.image_url}
                  alt="Imagen del mensaje"
                  className="max-w-full h-auto rounded-lg mt-2 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(message.image_url!, '_blank')}
                />
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-dark-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formatTime(message.created_at)}
        </div>

        {/* Options menu */}
        {!isEditing && (
          <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-8' : 'right-0 translate-x-8'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full bg-dark-300 hover:bg-dark-400 text-dark-500 hover:text-white transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-8 bg-dark-200 border border-dark-300 rounded-lg py-1 shadow-lg z-10 min-w-[120px]`}
                  >
                    {message.content && (
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-dark-300 transition-colors"
                      >
                        {copySuccess ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copySuccess ? 'Copiado' : 'Copiar'}
                      </button>
                    )}
                    
                    {isOwnMessage && !isAI && (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setShowMenu(false)
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-dark-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Editar
                        </button>
                        
                        <button
                          onClick={handleDelete}
                          disabled={loading}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-dark-300 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {loading ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}