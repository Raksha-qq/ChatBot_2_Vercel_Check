import React, { useState, useEffect, useRef } from 'react';
import BotAvatar from './components/BotAvatar';
import ChatMessage from './components/ChatMessage';
import QuickPrompts from './components/QuickPrompts';
import AudioVisualizer from './components/AudioVisualizer';
import { PERSONALITIES, getBotResponse } from './utils/botBrain';
import { sounds } from './utils/audio';
import { launchConfetti } from './utils/confetti';
import './App.css';

export default function App() {
  const [personalityKey, setPersonalityKey] = useState('nova');
  const [theme, setTheme] = useState('cyber-dark'); // cyber-dark, neon-galaxy, midnight-violet
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  const [botEmotion, setBotEmotion] = useState('idle');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const personality = PERSONALITIES[personalityKey];

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome-1',
      sender: 'bot',
      text: PERSONALITIES.nova.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: 'happy',
      actions: [
        "✨ What can you do?",
        "💡 Tell me a cool science fact",
        "⚛️ Show React custom hook",
        "🎲 Roll a die"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const speechRef = useRef(null);

  // Sync sound mute setting with audio engine
  useEffect(() => {
    sounds.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Smooth auto-scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  // Handle personality change
  const handleSelectPersonality = (key) => {
    if (key === personalityKey) return;
    sounds.playClick();
    setPersonalityKey(key);
    const newPersonality = PERSONALITIES[key];
    setBotEmotion('happy');

    // Add greeting for new personality
    const greetingMsg = {
      id: `persona-${Date.now()}`,
      sender: 'bot',
      text: newPersonality.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: 'happy',
      actions: newPersonality.quickPrompts.map(p => p.query)
    };

    setMessages((prev) => [...prev, greetingMsg]);
    setTimeout(() => setBotEmotion('idle'), 2000);
  };

  // Text-To-Speech handler
  const handleSpeak = (text, messageId) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#>`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = personalityKey === 'cipher' ? 0.9 : personalityKey === 'zen' ? 0.85 : 1.1;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
      setBotEmotion('talking');
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setBotEmotion('idle');
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setBotEmotion('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Voice Input (Speech Recognition)
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice recognition not supported in this browser.');
      setTimeout(() => setVoiceNotice(''), 3000);
      return;
    }

    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        sounds.playClick();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Send message flow
  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isBotTyping) return;

    sounds.playSend();

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowEmojiPicker(false);

    // Bot processing state
    setIsBotTyping(true);
    setBotEmotion('thinking');

    // Simulate smart thinking delay & response calculation
    setTimeout(() => {
      const responseData = getBotResponse(query, personalityKey);

      // Check special celebration effects
      if (responseData.triggerEffect === 'celebrate') {
        launchConfetti();
        sounds.playCelebrate();
      }

      // Stream text response smoothly with typewriter effect
      streamBotResponse(responseData);
    }, 600 + Math.random() * 400);
  };

  // Simulate streaming response
  const streamBotResponse = (responseData) => {
    const fullText = responseData.text;
    const botMsgId = `bot-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Initial empty bot message placeholder
    const newBotMsg = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      timestamp,
      actions: responseData.actions,
      emotion: responseData.emotion
    };

    setMessages((prev) => [...prev, newBotMsg]);
    setBotEmotion('talking');
    sounds.playReceive();

    const words = fullText.split(' ');
    let currentIdx = 0;
    const streamInterval = 28; // ms per word

    const intervalId = setInterval(() => {
      currentIdx += 2;
      const currentChunk = words.slice(0, currentIdx).join(' ');

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId ? { ...msg, text: currentChunk } : msg
        )
      );

      if (currentIdx >= words.length) {
        clearInterval(intervalId);
        setIsBotTyping(false);
        setBotEmotion(responseData.emotion || 'happy');

        // Text-to-speech if globally enabled
        if (ttsEnabled) {
          handleSpeak(fullText, botMsgId);
        }

        // Return to idle after a few seconds
        setTimeout(() => {
          setBotEmotion('idle');
        }, 3000);
      }
    }, streamInterval);
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm('Reset conversation and clear chat history?')) {
      sounds.playClick();
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'bot',
          text: `Chat reset! I'm ${personality.name}. What would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emotion: 'happy',
          actions: personality.quickPrompts.map(p => p.query)
        }
      ]);
    }
  };

  // Export conversation as Markdown
  const handleExportChat = () => {
    sounds.playClick();
    const chatText = messages
      .map(
        (m) =>
          `### ${m.sender === 'user' ? 'You' : personality.name} (${m.timestamp})\n\n${m.text}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([`# Chat with ${personality.name}\n\n${chatText}`], {
      type: 'text/markdown;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatbot-conversation-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    sounds.playClick();
    inputRef.current?.focus();
  };

  const emojis = ['⚡', '✨', '🚀', '💡', '🤖', '🎉', '🔥', '❤️', '🧠', '☕'];

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Ambient Cyber Background Lighting Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Main Glassmorphic Chat Shell */}
      <main className="chat-window">
        {/* Navigation & Header */}
        <header className="chat-header">
          <div className="bot-identity-group">
            <div className="header-avatar-slot">
              <BotAvatar emotion={botEmotion} size="normal" personality={personalityKey} />
            </div>

            <div className="bot-meta-info">
              <div className="title-row">
                <h1 className="bot-name">{personality.name}</h1>
                <span className="personality-tag" style={{ borderColor: personality.accentColor, color: personality.accentColor }}>
                  {personality.badge}
                </span>
                <span className="status-indicator">
                  <span className="pulsing-dot" />
                  Online
                </span>
              </div>
              <p className="bot-subline">{personality.title}</p>
            </div>
          </div>

          {/* Personality Switcher & Controls */}
          <div className="header-controls">
            {/* Personality Selector Dropdown/Tabs */}
            <div className="personality-selector">
              {Object.values(PERSONALITIES).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`persona-pill ${personalityKey === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectPersonality(p.id)}
                  title={`Switch to ${p.name} mode`}
                  style={{
                    '--p-color': p.accentColor
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Quick Action Icon Buttons */}
            <div className="control-icons-group">
              {/* Sound Toggle */}
              <button
                type="button"
                className={`icon-tool-btn ${soundEnabled ? 'active' : 'muted'}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              >
                {soundEnabled ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>

              {/* Text-To-Speech Auto Toggle */}
              <button
                type="button"
                className={`icon-tool-btn ${ttsEnabled ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setTtsEnabled(!ttsEnabled);
                }}
                title={ttsEnabled ? 'Auto-TTS enabled' : 'Enable Auto-TTS'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {/* Theme Cycle Toggle */}
              <button
                type="button"
                className="icon-tool-btn"
                onClick={() => {
                  sounds.playClick();
                  const themes = ['cyber-dark', 'neon-galaxy', 'midnight-violet'];
                  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
                  setTheme(nextTheme);
                }}
                title="Change color theme"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </button>

              {/* Export Transcript */}
              <button
                type="button"
                className="icon-tool-btn"
                onClick={handleExportChat}
                title="Export conversation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>

              {/* Clear History */}
              <button
                type="button"
                className="icon-tool-btn danger"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Message Feed Area */}
        <section className="chat-messages-area">
          {/* Welcome Banner Card */}
          <div className="welcome-banner-card">
            <div className="welcome-hero-avatar">
              <BotAvatar emotion={botEmotion} size="large" personality={personalityKey} />
              <div className="avatar-hint-badge">Click me to interact! ✨</div>
            </div>
            <h2 className="welcome-title">
              Meet <span className="gradient-text">{personality.name}</span>
            </h2>
            <p className="welcome-desc">
              Your interactive, animated intelligence companion. Ask coding questions, brainstorm creative ideas, or enjoy micro-games!
            </p>

            {/* Quick Starters */}
            <QuickPrompts
              prompts={personality.quickPrompts}
              onSelectPrompt={handleSendMessage}
              personalityTitle={personality.title}
            />
          </div>

          {/* List of Messages */}
          <div className="messages-stream">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onActionClick={handleSendMessage}
                onSpeak={handleSpeak}
                isSpeakingThis={speakingMessageId === msg.id}
                personality={personalityKey}
              />
            ))}

            {/* Animated Typing Indicator */}
            {isBotTyping && (
              <div className="message-row bot-row typing-row">
                <div className="message-avatar-wrap">
                  <BotAvatar emotion="thinking" size="small" personality={personalityKey} />
                </div>
                <div className="typing-indicator-bubble">
                  <span className="typing-dot d1"></span>
                  <span className="typing-dot d2"></span>
                  <span className="typing-dot d3"></span>
                  <span className="typing-text">{personality.name} is processing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* Voice recording notice toast */}
        {voiceNotice && <div className="voice-notice-toast">{voiceNotice}</div>}

        {/* Live Audio Visualizer Overlay */}
        <AudioVisualizer
          isActive={isListening || botEmotion === 'talking'}
          label={isListening ? 'Listening to your voice...' : `${personality.name} is speaking...`}
        />

        {/* Input Bar & Controls */}
        <footer className="chat-input-bar">
          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="emoji-popover">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="emoji-btn"
                  onClick={() => handleInsertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="input-glow-container">
            {/* Emoji Toggle Button */}
            <button
              type="button"
              className={`input-accessory-btn ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              title="Insert emoji"
            >
              😊
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              className={`input-accessory-btn mic-btn ${isListening ? 'recording' : ''}`}
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Speak message'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              className="chat-text-input"
              placeholder={`Message ${personality.name}... (Press Enter to send)`}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (botEmotion === 'idle' && e.target.value.length > 0) {
                  setBotEmotion('happy');
                }
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* Send Button */}
            <button
              type="button"
              className={`send-button ${inputText.trim() ? 'ready' : ''}`}
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isBotTyping}
              title="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
