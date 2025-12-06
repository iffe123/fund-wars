
import React, { useState, useEffect } from 'react';

interface SanityEffectsProps {
  stress: number;
  dependency: number;
}

const SanityEffects: React.FC<SanityEffectsProps> = ({ stress, dependency }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [ghostNotification, setGhostNotification] = useState<string | null>(null);

  // High Stress Glitch Effect
  useEffect(() => {
    if (stress < 80) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 100 + Math.random() * 200);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stress]);

  // Dependency Hallucinations (Ghost Notifications)
  useEffect(() => {
    if (dependency < 50) return;

    const messages = [
      "They know.",
      "Check the logs.",
      "Don't trust Chad.",
      "Are you watching?",
      "RUN",
      "ERROR: SYSTEM FAILURE"
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setGhostNotification(msg);
        setTimeout(() => setGhostNotification(null), 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dependency]);

  if (stress < 50 && dependency < 30) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes chromatic {
          0% { text-shadow: 2px 0 red, -2px 0 blue; }
          100% { text-shadow: -2px 0 red, 2px 0 blue; }
        }
        .glitch-active {
            animation: shake 0.5s;
            filter: hue-rotate(90deg) contrast(150%);
        }
      `}</style>
      
      {/* Visual Noise/Blur based on Stress */}
      {stress > 70 && (
          <div 
            className="absolute inset-0 bg-noise opacity-5"
            style={{ 
                backdropFilter: `blur(${Math.max(0, (stress - 70) / 10)}px)`,
                pointerEvents: 'none'
            }}
          ></div>
      )}

      {/* Glitch Flash */}
      {glitchActive && (
          <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply glitch-active"></div>
      )}

      {/* Ghost Notification */}
      {ghostNotification && (
          <div className="absolute top-10 right-10 bg-black/60 text-red-500 font-mono p-4 rounded border border-red-500 animate-bounce">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {ghostNotification}
          </div>
      )}
    </div>
  );
};

export default SanityEffects;
