'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const LOGO_URL = 'https://raw.githubusercontent.com/Santyck123/argensys-chatbot/main/logo.png'

const MAX_MESSAGES = 20

const FEATURES = [
  { icon: '🏡', text: 'Consulta propiedades disponibles en tiempo real' },
  { icon: '💬', text: 'Responde dudas sobre alquileres y condiciones' },
  { icon: '📅', text: 'Agenda visitas automáticamente' },
  { icon: '📸', text: 'Analiza imágenes de propiedades' },
  { icon: '🧠', text: 'Recuerda el contexto de tu conversación' },
  { icon: '⚡', text: 'Disponible 24/7 sin esperas' },
]

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '¡Hola! Soy Juan, tu asesor inmobiliario virtual de Argensys 👋\n\nEstoy aquí para ayudarte a encontrar la propiedad ideal, responder tus consultas sobre alquileres y coordinar visitas. ¿En qué puedo ayudarte hoy?',
  timestamp: new Date(),
}

function Avatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
         style={{ background: 'linear-gradient(135deg, #2467e0, #00aadd)' }}>
      <span className="text-white text-xs font-bold">J</span>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <Avatar />
      <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  const time = msg.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="flex flex-col items-end gap-1">
          <div className="message-bubble px-4 py-3 rounded-2xl rounded-br-sm text-white text-sm shadow-md"
               style={{ background: 'linear-gradient(135deg, #1a3a9f, #2467e0)' }}>
            {msg.content}
          </div>
          <span className="text-xs text-gray-400 pr-1">{time}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2 animate-slide-up">
      <Avatar />
      <div className="flex flex-col gap-1">
        <div className="message-bubble bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-700 text-sm shadow-sm whitespace-pre-wrap">
          {msg.content}
        </div>
        <span className="text-xs text-gray-400 pl-1">{time}</span>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages]   = useState<Message[]>([WELCOME])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebar] = useState(false)
  const [sessionId]               = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  const messagesEndRef             = useRef<HTMLDivElement>(null)
  const inputRef                   = useRef<HTMLTextAreaElement>(null)

  const userCount      = messages.filter(m => m.role === 'user').length
  const remaining      = MAX_MESSAGES - userCount
  const isLimitReached = remaining <= 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading || isLimitReached) return
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: `a_${Date.now()}`, role: 'assistant',
        content: data.response || 'Lo siento, hubo un error. Por favor intentá nuevamente.',
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `a_${Date.now()}`, role: 'assistant',
        content: 'Hubo un error de conexión. Por favor intentá nuevamente.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, isLimitReached, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const counterColor = remaining > 10 ? 'text-green-400' : remaining > 5 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1847 0%, #1a3a9f 100%)' }}>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebar(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 lg:z-auto h-full w-72 flex-shrink-0 flex flex-col gap-6 px-6 py-8 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="Argensys" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Sistema de Automatización<br />para Inmobiliarias</h1>
            <p className="text-blue-300 text-xs mt-1 font-medium tracking-wide uppercase">Impulsado por IA</p>
          </div>
        </div>
        <div className="border-t border-white/10" />
        <p className="text-blue-200 text-sm leading-relaxed">
          Juan es tu asesor inmobiliario virtual disponible las 24 horas. Encontrá tu propiedad ideal, resolvé consultas y agendá visitas — todo en una conversación.
        </p>
        <ul className="flex flex-col gap-3">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
              <span className="text-blue-100 text-xs leading-relaxed">{f.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto text-center">
          <p className="text-white/30 text-xs">© 2025 Argensys · Todos los derechos reservados</p>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setSidebar(true)} className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #2467e0, #00aadd)' }}>
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">Juan · Asesor Inmobiliario Virtual</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs">En línea</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className={`text-xs font-semibold ${counterColor}`}>{remaining}/{MAX_MESSAGES}</span>
            <p className="text-white/40 text-xs hidden sm:block">mensajes</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4" style={{ background: '#f5f8ff' }}>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {isLoading && <TypingIndicator />}
          {isLimitReached && !isLoading && (
            <div className="text-center animate-fade-in">
              <div className="inline-block bg-orange-50 border border-orange-200 text-orange-700 text-xs px-4 py-2 rounded-full">
                Límite de {MAX_MESSAGES} mensajes alcanzado para esta sesión
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              ref={inputRef} rows={1} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isLimitReached}
              placeholder={isLimitReached ? 'Límite de mensajes alcanzado' : 'Escribí tu consulta... (Enter para enviar)'}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none outline-none max-h-28 py-1 disabled:cursor-not-allowed"
              style={{ minHeight: '24px' }}
            />
            <button onClick={sendMessage}
              disabled={!input.trim() || isLoading || isLimitReached}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1a3a9f, #2467e0)' }}>
              {isLoading
                ? <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              }
            </button>
          </div>
          <p className="text-center text-gray-400 text-xs mt-2">Argensys · Asesor inmobiliario virtual impulsado por IA</p>
        </div>
      </main>
    </div>
  )
}
