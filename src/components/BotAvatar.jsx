import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/audio';

/**
 * Interactive Animated Robot Avatar "NEO/NOVA"
 * - Reactive states: 'idle', 'thinking', 'talking', 'happy', 'surprised', 'zen'
 * - Eye tracking follows mouse cursor
 * - Click to spin and giggle
 * - Ambient floating and glow animations
 */
export default function BotAvatar({ emotion = 'idle', size = 'normal', personality = 'nova' }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [blink, setBlink] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const avatarRef = useRef(null);

  // Auto-blink effect when idle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle eye tracking based on mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp movement within -6px to +6px
      setMouseOffset({
        x: Math.max(-5, Math.min(5, deltaX * 5)),
        y: Math.max(-4, Math.min(4, deltaY * 4))
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = () => {
    sounds.playPurr();
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 900);
  };

  // Determine colors based on personality
  const personalityGlows = {
    nova: { primary: '#8B5CF6', secondary: '#EC4899', aura: 'rgba(139, 92, 246, 0.45)' },
    cipher: { primary: '#06B6D4', secondary: '#3B82F6', aura: 'rgba(6, 182, 212, 0.45)' },
    muse: { primary: '#EC4899', secondary: '#F59E0B', aura: 'rgba(236, 72, 153, 0.45)' },
    zen: { primary: '#10B981', secondary: '#06B6D4', aura: 'rgba(16, 185, 129, 0.45)' }
  };

  const currentTheme = personalityGlows[personality] || personalityGlows.nova;
  const isLarge = size === 'large';
  const width = isLarge ? 110 : 64;
  const height = isLarge ? 110 : 64;

  return (
    <div
      ref={avatarRef}
      className={`bot-avatar-container ${emotion} ${isSpinning ? 'spin-react' : ''} ${size}`}
      onClick={handleClick}
      title="Click me to interact!"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        '--aura-color': currentTheme.aura,
        '--primary-glow': currentTheme.primary,
        '--secondary-glow': currentTheme.secondary
      }}
    >
      <div className="bot-aura-glow"></div>

      {/* Floating SVG Character */}
      <svg
        viewBox="0 0 100 100"
        className="bot-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="antennaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.secondary} />
            <stop offset="100%" stopColor={currentTheme.primary} />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Ring for Thinking / Active mode */}
        {emotion === 'thinking' && (
          <circle
            cx="50"
            cy="52"
            r="44"
            stroke={currentTheme.primary}
            strokeWidth="1.5"
            strokeDasharray="8 6"
            className="orbital-ring"
            opacity="0.8"
          />
        )}

        {/* Antenna */}
        <g className="antenna-group">
          <line
            x1="50"
            y1="22"
            x2="50"
            y2="10"
            stroke="url(#antennaGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="8"
            r="4"
            fill={currentTheme.secondary}
            filter="url(#neonGlow)"
            className="antenna-ball"
          />
        </g>

        {/* Robot Ears / Headset */}
        <rect x="18" y="44" width="6" height="16" rx="3" fill="#334155" />
        <rect x="76" y="44" width="6" height="16" rx="3" fill="#334155" />
        <circle cx="21" cy="52" r="2.5" fill={currentTheme.primary} />
        <circle cx="79" cy="52" r="2.5" fill={currentTheme.primary} />

        {/* Main Head Chassis */}
        <rect
          x="22"
          y="22"
          width="56"
          height="54"
          rx="18"
          fill="url(#bodyGrad)"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1.5"
          className="head-chassis"
        />

        {/* Visor Screen */}
        <rect
          x="28"
          y="32"
          width="44"
          height="34"
          rx="11"
          fill="url(#visorGrad)"
          stroke={currentTheme.primary}
          strokeWidth="1.2"
          strokeOpacity="0.5"
          className="visor-screen"
        />

        {/* Visor Glare / Reflection */}
        <path
          d="M 33 36 Q 50 34 67 36 Q 60 41 33 42 Z"
          fill="rgba(255, 255, 255, 0.08)"
        />

        {/* Eyes & Expressions */}
        <g
          className="eyes-group"
          transform={`translate(${mouseOffset.x}, ${mouseOffset.y})`}
        >
          {/* 1. HAPPY Expression (Arc Eyes) */}
          {emotion === 'happy' && (
            <>
              <path
                d="M 36 50 Q 42 42 48 50"
                stroke={currentTheme.primary}
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                filter="url(#neonGlow)"
              />
              <path
                d="M 52 50 Q 58 42 64 50"
                stroke={currentTheme.primary}
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                filter="url(#neonGlow)"
              />
              {/* Cute blush cheeks */}
              <circle cx="34" cy="55" r="2.5" fill="#EC4899" opacity="0.6" />
              <circle cx="66" cy="55" r="2.5" fill="#EC4899" opacity="0.6" />
            </>
          )}

          {/* 2. ZEN Expression (Serene Curved Sleepy Eyes) */}
          {emotion === 'zen' && (
            <>
              <path
                d="M 36 49 Q 42 54 48 49"
                stroke={currentTheme.primary}
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                filter="url(#neonGlow)"
              />
              <path
                d="M 52 49 Q 58 54 64 49"
                stroke={currentTheme.primary}
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                filter="url(#neonGlow)"
              />
            </>
          )}

          {/* 3. THINKING Expression (Radar / Rotating Scanning line) */}
          {emotion === 'thinking' && (
            <>
              <circle
                cx="42"
                cy="48"
                r="6"
                stroke={currentTheme.primary}
                strokeWidth="2"
                strokeDasharray="4 3"
                className="thinking-eye-spin"
                fill="none"
                filter="url(#neonGlow)"
              />
              <circle
                cx="58"
                cy="48"
                r="6"
                stroke={currentTheme.secondary}
                strokeWidth="2"
                strokeDasharray="4 3"
                className="thinking-eye-spin reverse"
                fill="none"
                filter="url(#neonGlow)"
              />
            </>
          )}

          {/* 4. SURPRISED Expression (Wide glowing eyes) */}
          {emotion === 'surprised' && (
            <>
              <ellipse
                cx="42"
                cy="48"
                rx="6.5"
                ry="8"
                fill={currentTheme.primary}
                filter="url(#neonGlow)"
              />
              <circle cx="44" cy="46" r="2" fill="#FFFFFF" />
              <ellipse
                cx="58"
                cy="48"
                rx="6.5"
                ry="8"
                fill={currentTheme.primary}
                filter="url(#neonGlow)"
              />
              <circle cx="60" cy="46" r="2" fill="#FFFFFF" />
            </>
          )}

          {/* 5. TALKING Expression (Soundwave bars) */}
          {emotion === 'talking' && (
            <g className="talking-mouth" filter="url(#neonGlow)">
              <rect x="36" y="46" width="3" height="8" rx="1.5" fill={currentTheme.primary} className="bar b1" />
              <rect x="42" y="43" width="3" height="14" rx="1.5" fill={currentTheme.secondary} className="bar b2" />
              <rect x="48" y="41" width="3" height="18" rx="1.5" fill={currentTheme.primary} className="bar b3" />
              <rect x="54" y="43" width="3" height="14" rx="1.5" fill={currentTheme.secondary} className="bar b4" />
              <rect x="60" y="46" width="3" height="8" rx="1.5" fill={currentTheme.primary} className="bar b5" />
            </g>
          )}

          {/* 6. IDLE Expression (Standard glowing expressive oval eyes with blink) */}
          {(emotion === 'idle' || !['happy', 'zen', 'thinking', 'surprised', 'talking'].includes(emotion)) && (
            <>
              {blink ? (
                <>
                  <line
                    x1="37"
                    y1="48"
                    x2="47"
                    y2="48"
                    stroke={currentTheme.primary}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="53"
                    y1="48"
                    x2="63"
                    y2="48"
                    stroke={currentTheme.primary}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <ellipse
                    cx="42"
                    cy="48"
                    rx="5"
                    ry="6.5"
                    fill={currentTheme.primary}
                    filter="url(#neonGlow)"
                  />
                  <circle cx="43.5" cy="46.5" r="1.8" fill="#FFFFFF" />
                  <ellipse
                    cx="58"
                    cy="48"
                    rx="5"
                    ry="6.5"
                    fill={currentTheme.primary}
                    filter="url(#neonGlow)"
                  />
                  <circle cx="59.5" cy="46.5" r="1.8" fill="#FFFFFF" />
                </>
              )}
            </>
          )}
        </g>

        {/* Small subtle smile for idle */}
        {emotion === 'idle' && !blink && (
          <path
            d="M 46 58 Q 50 61 54 58"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}
