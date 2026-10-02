import React, { useState } from 'react';
import BotAvatar from './BotAvatar';
import { sounds } from '../utils/audio';

export default function ChatMessage({
  message,
  onActionClick,
  onSpeak,
  isSpeakingThis,
  personality
}) {
  const { id, sender, text, timestamp, actions, emotion } = message;
  const isUser = sender === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [codeCopiedIndex, setCodeCopiedIndex] = useState(null);

  const handleCopyMessage = () => {
    sounds.playClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (codeText, index) => {
    sounds.playClick();
    navigator.clipboard.writeText(codeText);
    setCodeCopiedIndex(index);
    setTimeout(() => setCodeCopiedIndex(null), 2000);
  };

  const handleLike = () => {
    sounds.playClick();
    setLiked(!liked);
  };

  // Simple Markdown Parser: Handles code blocks, bold, italics, quotes, lists
  const renderFormattedContent = (content) => {
    // Check for code blocks ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let codeIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2].trim(),
        index: codeIndex++
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex)
      });
    }

    return parts.map((part, pIdx) => {
      if (part.type === 'code') {
        const isThisCopied = codeCopiedIndex === part.index;
        return (
          <div key={`code-${pIdx}`} className="code-block-wrapper">
            <div className="code-header">
              <span className="code-lang-tag">{part.language || 'code'}</span>
              <button
                type="button"
                className={`copy-code-btn ${isThisCopied ? 'copied' : ''}`}
                onClick={() => handleCopyCode(part.code, part.index)}
              >
                {isThisCopied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="code-pre">
              <code>{part.code}</code>
            </pre>
          </div>
        );
      }

      // Format markdown elements inside regular text blocks
      const lines = part.value.split('\n');
      return (
        <div key={`text-${pIdx}`} className="text-paragraphs">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lIdx} className="line-break" />;
            }

            // Blockquote
            if (trimmed.startsWith('>')) {
              const quoteContent = trimmed.replace(/^>\s*/, '');
              return (
                <blockquote key={lIdx} className="message-quote">
                  {formatInline(quoteContent)}
                </blockquote>
              );
            }

            // Bullet list item
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              return (
                <div key={lIdx} className="bullet-item">
                  <span className="bullet-dot">•</span>
                  <span>{formatInline(trimmed.substring(2))}</span>
                </div>
              );
            }

            // Numbered list item
            if (/^\d+\.\s/.test(trimmed)) {
              const numMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
              return (
                <div key={lIdx} className="numbered-item">
                  <span className="num-prefix">{numMatch[1]}</span>
                  <span>{formatInline(numMatch[2])}</span>
                </div>
              );
            }

            return (
              <p key={lIdx} className="message-p">
                {formatInline(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for inline markdown: **bold**, *italic*, `code`
  const formatInline = (str) => {
    const tokens = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let last = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) {
        tokens.push(str.substring(last, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        tokens.push(
          <strong key={match.index} className="highlight-bold">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        tokens.push(
          <em key={match.index} className="highlight-italic">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        tokens.push(
          <code key={match.index} className="inline-code">
            {token.slice(1, -1)}
          </code>
        );
      }
      last = match.index + token.length;
    }

    if (last < str.length) {
      tokens.push(str.substring(last));
    }

    return tokens.length ? tokens : str;
  };

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      {!isUser && (
        <div className="message-avatar-wrap">
          <BotAvatar emotion={emotion || 'idle'} size="small" personality={personality} />
        </div>
      )}

      <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
        <div className="message-content">
          {renderFormattedContent(text)}
        </div>

        {/* Suggested Quick Actions */}
        {!isUser && actions && actions.length > 0 && (
          <div className="message-actions-container">
            <span className="actions-label">Suggested follow-ups:</span>
            <div className="actions-chip-list">
              {actions.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="action-chip"
                  onClick={() => onActionClick(act)}
                >
                  <span className="action-sparkle">✦</span>
                  {act}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Meta Info & Toolbar */}
        <div className="message-meta-bar">
          <span className="message-time">{timestamp}</span>

          {!isUser && (
            <div className="message-toolbar">
              <button
                type="button"
                className={`tool-btn ${liked ? 'active' : ''}`}
                onClick={handleLike}
                title="Like response"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              <button
                type="button"
                className={`tool-btn ${isSpeakingThis ? 'speaking' : ''}`}
                onClick={() => onSpeak(text, id)}
                title={isSpeakingThis ? "Stop speaking" : "Listen aloud"}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </button>

              <button
                type="button"
                className={`tool-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyMessage}
                title="Copy entire message"
              >
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {isUser && (
            <span className="read-receipt" title="Delivered">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="user-avatar-wrap">
          <div className="user-avatar-badge">You</div>
        </div>
      )}
    </div>
  );
}
