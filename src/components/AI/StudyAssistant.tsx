import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import { ai, MODELS } from '@/src/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function StudyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de estudio Estelar. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: MODELS.FLASH,
        contents: [
          {
            role: 'user',
            parts: [{ text: `Eres un asistente de estudio para estudiantes universitarios. Ayúdalos con sus dudas académicas, organización del tiempo y planes de estudio. Sé motivador, conciso y útil. Usuario pregunta: ${userMessage}` }]
          }
        ],
      });

      const assistantMessage = response.text || "Lo siento, tuve un problema procesando tu respuesta.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Hubo un error al conectar con la IA. Por favor, verifica tu API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-[#03dac6]/20 bg-[#121212]/95 backdrop-blur-xl">
              <div className="p-4 border-b border-[#ffffff10] flex items-center justify-between bg-gradient-to-r from-[#bb86fc]/10 to-[#03dac6]/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#bb86fc]/20">
                    <Bot className="w-5 h-5 text-[#bb86fc]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Asistente Estelar</h3>
                    <p className="text-[10px] text-gray-400">Potenciado por Gemini</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-[#ffffff10]">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3",
                        msg.role === 'assistant' ? "justify-start" : "justify-end flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md",
                        msg.role === 'assistant' ? "bg-[#bb86fc]/10" : "bg-[#03dac6]/10"
                      )}>
                        {msg.role === 'assistant' ? (
                          <Bot className="w-3.5 h-3.5 text-[#bb86fc]" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-[#03dac6]" />
                        )}
                      </div>
                      <div className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed",
                        msg.role === 'assistant' 
                          ? "bg-[#1e1e1e] text-gray-200 rounded-tl-none border border-[#ffffff05]" 
                          : "bg-[#03dac6] text-black font-medium rounded-tr-none"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-[#bb86fc]/10">
                        <Loader2 className="w-3.5 h-3.5 text-[#bb86fc] animate-spin" />
                      </div>
                      <div className="bg-[#1e1e1e] text-gray-400 text-[10px] italic px-3 py-2 rounded-2xl flex items-center gap-2">
                        Pensando... <Sparkles className="w-3 h-3 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-[#ffffff10]">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Pregúntame algo..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-9 text-xs bg-[#1e1e1e] border-[#ffffff10] focus:border-[#03dac6]/50 focus:ring-0"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !input.trim()}
                    className="h-9 w-9 bg-[#bb86fc] hover:bg-[#a370e8] text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300",
          isOpen 
            ? "bg-[#cf6679] text-white rotate-90" 
            : "bg-gradient-to-tr from-[#bb86fc] to-[#03dac6] text-black"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
