import { useState, useRef, useEffect, useMemo } from 'react';
import { MdSmartToy, MdClose, MdSend, MdLightbulb } from 'react-icons/md';
import axiosInstance from '../../api/axios';

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your CityConnect AI Assistant. Ask me anything about raising complaints, status tracking, emergency numbers, or municipal guidelines.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('cityconnect-user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const userRole = storedUser?.role || 'citizen';

  const quickPrompts = useMemo(() => {
    if (userRole === 'admin') {
      return ['Pending complaints count', 'Smart Officer Assignment info', 'System Health Status'];
    }
    if (userRole === 'field_worker') {
      return ['How to update task status?', 'Emergency contacts'];
    }
    return ['How to raise a complaint?', 'Track complaint status', 'Emergency helpline numbers'];
  }, [userRole]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/ai/chat', {
        message: query,
        role: userRole
      });

      const replyText = response?.data?.reply || response?.reply || "I am processing your municipal request.";
      setMessages((prev) => [...prev, { sender: 'bot', text: replyText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'I am temporarily unable to reach the AI engine, but CityConnect services remain fully active.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(15, 76, 129, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          title="Open CityConnect AI Assistant"
        >
          <MdSmartToy size={28} />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          style={{
            width: '360px',
            height: '480px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
              color: '#ffffff',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MdSmartToy size={24} color="#60a5fa" />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>CityConnect AI Assistant</h4>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Smart City Intelligence Engine</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: m.sender === 'user' ? '#0f4c81' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '0.5rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '0.5rem 0.75rem', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <MdLightbulb color="#f59e0b" size={12} /> {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ padding: '0.75rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI assistant..."
              style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: '#0f4c81',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >
              <MdSend size={18} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

export default AIChatbot;
