import React from 'react';

export default function AudioVisualizer({ isActive, label = 'Listening...' }) {
  if (!isActive) return null;

  return (
    <div className="audio-visualizer-overlay">
      <div className="visualizer-content">
        <div className="wave-bars">
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className="wave-bar"
              style={{
                animationDelay: `${(i * 0.1).toFixed(2)}s`,
                height: `${20 + (i % 3) * 15}px`
              }}
            />
          ))}
        </div>
        <span className="visualizer-label">{label}</span>
      </div>
    </div>
  );
}
