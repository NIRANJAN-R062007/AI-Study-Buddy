import React, { useState, useRef, useEffect } from 'react';
import { useStudyBuddy } from '../../context/StudyBuddyContext';
import { studyBuddyAPI } from '../../services/api';
import './AIChat.css';

export default function AIChat() {
  const { state } = useStudyBuddy();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your AI Study Buddy. Ask me anything about your studies!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await studyBuddyAPI.askQuestion(input);

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: typeof response === 'string' ? response : response.answer || "I received your message but couldn't process a proper response.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <h1 className="chat-title">
          MACAVA
        </h1>
        <p className="chat-subtitle">
          Your personal AI tutor
        </p>
      </div>

      <div className="messages-area">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-wrapper ${msg.sender}`}
          >
            <div className={`message-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
              {msg.text}
            </div>
            <span className="message-info">
              {msg.sender === 'ai' ? '🤖 AI Assistant • ' : '👤 You • '}
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
