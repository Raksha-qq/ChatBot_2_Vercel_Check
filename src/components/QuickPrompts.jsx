import React from 'react';
import { sounds } from '../utils/audio';

export default function QuickPrompts({ prompts, onSelectPrompt, personalityTitle }) {
  const handleClick = (query) => {
    sounds.playClick();
    onSelectPrompt(query);
  };

  return (
    <div className="quick-prompts-wrapper">
      <div className="quick-prompts-header">
        <span className="spark-badge">⚡ Quick Starters</span>
        <span className="quick-sub">Click any question to begin:</span>
      </div>

      <div className="quick-prompts-grid">
        {prompts.map((item, index) => (
          <button
            key={index}
            type="button"
            className="quick-prompt-card"
            onClick={() => handleClick(item.query)}
          >
            <div className="quick-card-glow"></div>
            <span className="quick-card-text">{item.text}</span>
            <span className="quick-card-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
