import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Image, X } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, imageUrl?: string) => Promise<{ error?: any }>
  placeholder?: string
  disabled?: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Escribe un mensaje...",
  disabled = false
}) => {
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    // For demo purposes, we'll use a simple base64 encoding
    // In production, you'd upload to a service like Supabase Storage
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return

    setLoading(true)

    try {
      let imageUrl: string | undefined

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage) || undefined
      }

      const { error } = await onSendMessage(message, imageUrl)

      if (!error) {
        setMessage('')
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-dark-200 border-t border-dark-300 p-4">
      {/* Image preview */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 relative inline-block"
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-20 rounded-lg border border-dark-300"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-primary hover:bg-red-secondary text-white rounded-full p-1 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      <div className="flex items-end space-x-3">
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          className="flex-shrink-0 p-2 bg-dark-300 hover:bg-dark-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
        >
          <Image className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || loading}
            className="w-full bg-dark-300 border border-dark-400 text-white placeholder-dark-500 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={disabled || loading || (!message.trim() && !selectedImage)}
          className="flex-shrink-0 p-3 bg-red-primary hover:bg-red-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-primary focus:ring-offset-2 focus:ring-offset-dark-200"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-dark-500 flex justify-between">
        <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
        <span>Máximo 5MB por imagen</span>
      </div>
    </div>
  )
}