"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ChromaVideoAvatar from './ChromaVideoAvatar';
import type { LandingContent, BotCharacter } from '@/lib/landing_db';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LandingChatbotProps {
  config?: LandingContent['chatbot'];
}

export default function LandingChatbot({ config }: LandingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! 👋 Soy el asistente virtual de la empresa. ¿En qué te puedo ayudar hoy con tu proyecto de vivienda?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const characters = config?.characters || [];
  const activeChar: BotCharacter = characters.find(c => c.active) || characters[0] || {
    id: 'char-1',
    name: 'Personaje Principal',
    url: '/personaje-bot.mp4',
    type: 'video',
    isGreenScreen: true,
    active: true
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/landing-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un problema técnico. Por favor, intenta de nuevo.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ocurrió un error de conexión.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón / Personaje flotante de cuerpo completo */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-2 left-2 sm:bottom-4 sm:left-6 z-50 flex items-end justify-center"
          >
            {activeChar.type === 'video' ? (
              <ChromaVideoAvatar
                videoSrc={activeChar.url}
                isGreenScreen={activeChar.isGreenScreen}
                characterName={activeChar.name}
                position="left"
                onClick={() => setIsOpen(true)}
              />
            ) : (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center transition-all overflow-hidden border-[3px] border-white bg-white hover:border-sky-300"
              >
                <img 
                  src={activeChar.url || "/chatbot-avatar.png"} 
                  alt={activeChar.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                    }
                  }} 
                />
                <div className="hidden bg-blue-600 w-full h-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana del Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-4 flex justify-between items-center shadow-md relative z-10 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/20 bg-white shadow-inner">
                  <img src="/chatbot-avatar.png" alt="Bot" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-[family-name:var(--font-montserrat)] leading-tight">
                    {activeChar.name || "Asistente Virtual"}
                  </h3>
                  <p className="text-xs text-sky-200 font-medium">En línea</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] flex flex-col gap-4 font-[family-name:var(--font-work-sans)]">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.role === 'user' ? 'bg-[#2563eb]' : 'bg-white border border-slate-200'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <img src="/chatbot-avatar.png" alt="Bot" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                  </div>
                  
                  <div className={`max-w-[75%] p-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#2563eb] text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {/* Renderizar imágenes y saltos de línea */}
                    {msg.content.split(/(?:!\[.*?\]\(.*?\))/g).map((textPart, i, arr) => {
                      const imgMatch = msg.content.match(/!\[(.*?)\]\((.*?)\)/g);
                      const imgHtml = imgMatch && imgMatch[i] ? imgMatch[i].match(/!\[(.*?)\]\((.*?)\)/) : null;
                      
                      return (
                        <React.Fragment key={i}>
                          {textPart.split('\n').map((line, j) => (
                            <React.Fragment key={`t-${j}`}>
                              {line.split(/(?:\[.*?\]\(.*?\))/g).map((lPart, k) => {
                                  const lMatches = line.match(/\[(.*?)\]\((.*?)\)/g);
                                  const lHtml = lMatches && lMatches[k] ? lMatches[k].match(/\[(.*?)\]\((.*?)\)/) : null;
                                  return (
                                    <React.Fragment key={`l-${k}`}>
                                        {lPart}
                                        {lHtml && <a href={lHtml[2]} target="_blank" rel="noreferrer" className={msg.role === 'user' ? "text-sky-200 underline" : "text-blue-600 hover:underline font-medium"}>{lHtml[1]}</a>}
                                    </React.Fragment>
                                  )
                              })}
                              {j !== textPart.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                          {imgHtml && (
                            <a href={imgHtml[2]} target="_blank" rel="noreferrer">
                              <img src={imgHtml[2]} alt={imgHtml[1]} className="w-full rounded-lg mt-2 mb-2 shadow-sm border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity" />
                            </a>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src="/chatbot-avatar.png" alt="Bot" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="bg-white border border-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-slate-200 rounded-full p-1 pr-2 focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb] transition-all">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu consulta aquí..."
                  className="flex-1 bg-transparent px-4 py-2 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none font-[family-name:var(--font-work-sans)]"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-[-2px]" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
