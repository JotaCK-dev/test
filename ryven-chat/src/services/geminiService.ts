import { GoogleGenerativeAI } from '@google/generative-ai'

// This would normally be in an environment variable
// For demo purposes, you'll need to add your own Gemini API key here
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE'

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export interface GeminiResponse {
  content: string
  error?: string
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  private visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

  async generateResponse(
    prompt: string, 
    context: string[] = [],
    participants: string[] = []
  ): Promise<GeminiResponse> {
    try {
      // Build context for the AI
      let fullPrompt = ''
      
      // Add context about the chat participants
      if (participants.length > 0) {
        fullPrompt += `Participantes en este chat: ${participants.join(', ')}. `
      }
      
      // Add conversation context if available
      if (context.length > 0) {
        fullPrompt += `Contexto de la conversación:\n${context.join('\n')}\n\n`
      }
      
      // Add system prompt
      fullPrompt += `Eres RyVen AI, un asistente inteligente y amigable en una aplicación de chat. `
      fullPrompt += `Responde de manera útil, concisa y en español. `
      fullPrompt += `Mantén un tono conversacional y personaliza tus respuestas según el contexto. `
      fullPrompt += `Si hay múltiples participantes, puedes dirigirte a ellos por su nombre de usuario. `
      fullPrompt += `\n\nPregunta del usuario: ${prompt}`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      return {
        content: text
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return {
        content: '',
        error: 'Lo siento, no pude procesar tu mensaje en este momento. Por favor intenta de nuevo.'
      }
    }
  }

  async generateImageResponse(
    imageData: string,
    prompt: string,
    participants: string[] = []
  ): Promise<GeminiResponse> {
    try {
      // Convert base64 to the format Gemini expects
      const imageBase64 = imageData.split(',')[1]
      const mimeType = imageData.split(':')[1].split(';')[0]

      // Build prompt with context
      let fullPrompt = `Eres RyVen AI, un asistente inteligente. `
      
      if (participants.length > 0) {
        fullPrompt += `Los participantes en este chat son: ${participants.join(', ')}. `
      }
      
      fullPrompt += `Analiza la imagen y responde en español de manera útil y conversacional. `
      
      if (prompt) {
        fullPrompt += `Pregunta específica: ${prompt}`
      } else {
        fullPrompt += `Describe lo que ves en la imagen.`
      }

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }

      const result = await this.visionModel.generateContent([fullPrompt, imagePart])
      const response = await result.response
      const text = response.text()

      return {
        content: text
      }
    } catch (error) {
      console.error('Error generating AI image response:', error)
      return {
        content: '',
        error: 'Lo siento, no pude analizar la imagen en este momento. Por favor intenta de nuevo.'
      }
    }
  }

  buildConversationContext(messages: any[], maxMessages: number = 10): string[] {
    // Get last N messages for context
    const recentMessages = messages.slice(-maxMessages)
    
    return recentMessages.map(msg => {
      const sender = msg.is_ai ? 'RyVen AI' : (msg.profiles?.email?.split('@')[0] || 'Usuario')
      return `${sender}: ${msg.content || '[imagen]'}`
    })
  }

  extractParticipants(messages: any[]): string[] {
    const participants = new Set<string>()
    
    messages.forEach(msg => {
      if (!msg.is_ai && msg.profiles?.email) {
        participants.add(msg.profiles.email.split('@')[0])
      }
    })
    
    return Array.from(participants)
  }
}

export const geminiService = new GeminiService()