import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { GlobalChat } from '../components/Chat/GlobalChat'
import { AIChat } from '../components/Chat/AIChat'
import { Chat } from '../config/supabase'

export const ChatPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [activeChatType, setActiveChatType] = useState<'global' | 'ai'>('global')
  const [activeChatData, setActiveChatData] = useState<Chat | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleChatSelect = (chatId: string | null, chatType: 'global' | 'ai', chat?: Chat) => {
    setActiveChat(chatId)
    setActiveChatType(chatType)
    setActiveChatData(chat)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  return (
    <div className="h-screen bg-dark-100 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          isMobile={false}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        isMobile={true}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-dark-200 border-b border-dark-300 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white hover:bg-dark-300 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-primary rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <h1 className="text-white font-bold">RyVen Chat</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Chat Content */}
        <motion.div
          key={`${activeChatType}-${activeChat}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-hidden"
        >
          {activeChatType === 'global' ? (
            <GlobalChat />
          ) : (
            activeChatData && <AIChat chat={activeChatData} />
          )}
        </motion.div>
      </div>
    </div>
  )
}