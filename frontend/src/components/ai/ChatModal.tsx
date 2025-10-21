'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Fix4Ever assistant. How can I help you with your repair needs today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('screen') || lowerMessage.includes('display')) {
      return "For screen replacement, we recommend our certified technicians. The service typically takes 1-2 hours and comes with a 90-day warranty. Would you like me to help you book a screen replacement service?";
    }
    
    if (lowerMessage.includes('battery')) {
      return "Battery replacement is one of our most common services. We use high-quality batteries and provide warranty coverage. The cost varies by device model. Can you tell me which device needs battery replacement?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our pricing is transparent with no hidden costs. For an accurate estimate, I'd need to know the specific issue and device. You can also use our AI diagnosis tool for an instant cost estimate!";
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return "For emergency services, we have technicians available 24/7. Please call our emergency line at +91 1800-123-4567 or would you like me to connect you with an emergency technician right away?";
    }
    
    if (lowerMessage.includes('warranty')) {
      return "We provide a 90-day warranty on all repairs, covering both parts and labor. This includes free follow-up service if the same issue occurs. All our technicians are certified and use quality parts.";
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('how long')) {
      return "Most repairs are completed within 2-4 hours. Complex issues might take longer, but we'll always provide a time estimate before starting. Many services like screen replacements can be done while you wait!";
    }
    
    return "I understand you need repair assistance. Fix4Ever handles all types of repairs including electronics, appliances, plumbing, electrical, and home repairs. Could you provide more details about your specific issue so I can help you better?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "Screen repair cost?",
    "Battery replacement",
    "Emergency service",
    "Book a technician",
    "Warranty information"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Fix4Ever Assistant</h3>
                <p className="text-blue-100 text-sm">Online • Always here to help</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(reply)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↗
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatModal;