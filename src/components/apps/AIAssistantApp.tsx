
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Trash2, Settings, Bot } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

const AIAssistantApp: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isLoading,
    isListening,
    connectionStatus,
    sendMessage,
    startVoiceInput,
    stopVoiceInput,
    clearMessages
  } = useAIAssistant();

  const teslaSuggestions = [
    "What's my battery level?",
    "Start climate control",
    "Lock the car",
    "How far can I drive?",
    "Find Superchargers",
    "Set temperature to 72°F"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#27ae60';
      case 'connecting': return '#f39c12';
      default: return '#e74c3c';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'AI Connected';
      case 'connecting': return 'Connecting...';
      default: return 'AI Offline';
    }
  };

  return (
    <div className="ai-assistant-chat">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <div className="assistant-avatar">
            <Bot size={20} />
          </div>
          <div className="assistant-info">
            <h3>Tesla Companion AI</h3>
            <div className="assistant-status">
              <div 
                className="w-2 h-2 rounded-full mr-2 inline-block"
                style={{ backgroundColor: getConnectionStatusColor() }}
              />
              {getConnectionStatusText()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={clearMessages}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Tesla Suggestions */}
      <div className="tesla-suggestions">
        {teslaSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="suggestion-pill"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Welcome to Tesla Companion AI</h3>
            <p className="text-sm">
              I can help you control your Tesla, check vehicle status, and answer questions.
              Try asking "What's my battery level?" or use voice commands.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className={`message-avatar`}>
              {message.role === 'user' ? 'U' : <Bot size={16} />}
            </div>
            <div className="message-content">
              <div>{message.content}</div>
              {message.metadata?.command && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <strong>Action:</strong> {message.metadata.action}
                  {message.metadata.data && (
                    <div className="mt-1">
                      <strong>Details:</strong> {JSON.stringify(message.metadata.data)}
                    </div>
                  )}
                </div>
              )}
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your Tesla or anything else..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          
          <div className="input-actions">
            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`voice-button ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-4 w-80 border">
          <h4 className="font-semibold mb-3">AI Assistant Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Local AI (Ollama)</span>
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Voice Recognition</span>
              <div className={`w-3 h-3 rounded-full ${recognition ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="text-xs text-gray-600 mt-4">
              <p><strong>Ollama Setup:</strong></p>
              <p>1. Install Ollama on your local network</p>
              <p>2. Download phi3-mini-4k-instruct model</p>
              <p>3. Ensure port 11434 is accessible</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistantApp;
