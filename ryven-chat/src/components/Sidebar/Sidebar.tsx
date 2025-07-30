import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Bot, 
  Plus, 
  LogOut, 
  Settings,
  MessageCircle,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Chat } from '../../config/supabase'

interface SidebarProps {
  activeChat: string | null
  onChatSelect: (chatId: string | null, chatType: 'global' | 'ai', chat?: Chat) => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeChat,
  onChatSelect,
  isMobile = false,
  isOpen = true,
  onClose
}) => {
  const { user, signOut } = useAuth()
  const [aiChats, setAiChats] = useState<Chat[]>([])
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [newChatName, setNewChatName] = useState('')

  // Fetch AI chats
  useEffect(() => {
    const fetchAIChats = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'ai')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAiChats(data)
      }
    }

    fetchAIChats()

    // Subscribe to chat changes
    const channel = supabase
      .channel('user-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `created_by=eq.${user?.id}`
        },
        () => {
          fetchAIChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const createAIChat = async () => {
    if (!newChatName.trim() || !user) return

    setIsCreatingChat(true)

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          name: newChatName.trim(),
          type: 'ai',
          created_by: user.id
        })
        .select()
        .single()

      if (!error && data) {
        setNewChatName('')
        onChatSelect(data.id, 'ai', data)
      }
    } catch (err) {
      console.error('Error creating chat:', err)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const deleteAIChat = async (chatId: string) => {
    if (!user) return

    try {
      await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('created_by', user.id)

      // If this was the active chat, switch to global
      if (activeChat === chatId) {
        onChatSelect(null, 'global')
      }
    } catch (err) {
      console.error('Error deleting chat:', err)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-dark-200 border-r border-dark-300">
      {/* Header */}
      <div className="p-4 border-b border-dark-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">RyVen Chat</h2>
              <p className="text-dark-500 text-xs">{user?.email?.split('@')[0]}</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 text-dark-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {/* Global Chat */}
        <div className="p-3">
          <h3 className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Chat Público
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChatSelect(null, 'global')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
              activeChat === null
                ? 'bg-red-primary text-white'
                : 'text-dark-400 hover:bg-dark-300 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              activeChat === null ? 'bg-white/20' : 'bg-red-primary/20'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Chat Global</p>
              <p className="text-xs opacity-70">Todos los usuarios</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </motion.button>
        </div>

        {/* AI Chats */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-dark-500 text-xs font-semibold uppercase tracking-wider">
              Chats con IA
            </h3>
            <button
              onClick={() => setIsCreatingChat(!isCreatingChat)}
              className="p-1 text-dark-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Create new chat form */}
          <AnimatePresence>
            {isCreatingChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="bg-dark-300 rounded-lg p-3">
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="Nombre del chat..."
                    className="w-full bg-dark-100 text-white placeholder-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-primary"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        createAIChat()
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={createAIChat}
                      disabled={!newChatName.trim()}
                      className="flex-1 bg-red-primary hover:bg-red-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-xs transition-colors"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingChat(false)
                        setNewChatName('')
                      }}
                      className="bg-dark-400 hover:bg-dark-500 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Chat list */}
          <div className="space-y-2">
            {aiChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChatSelect(chat.id, 'ai', chat)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    activeChat === chat.id
                      ? 'bg-purple-600 text-white'
                      : 'text-dark-400 hover:bg-dark-300 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeChat === chat.id ? 'bg-white/20' : 'bg-purple-600/20'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">{chat.name}</p>
                    <p className="text-xs opacity-70">Chat con IA</p>
                  </div>
                </motion.button>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteAIChat(chat.id)
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {aiChats.length === 0 && !isCreatingChat && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-dark-400 mx-auto mb-3" />
              <p className="text-dark-500 text-sm">
                No tienes chats con IA
              </p>
              <button
                onClick={() => setIsCreatingChat(true)}
                className="text-purple-400 hover:text-purple-300 text-sm mt-2 transition-colors"
              >
                Crear el primero
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-dark-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-dark-500 hover:text-red-400 p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-80 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="w-80 h-full">
      {sidebarContent}
    </div>
  )
}