
import React, { useEffect, useCallback, useRef } from 'react';

export type SwitchType = 'blue' | 'brown' | 'red';

interface TypingAudioProps {
  enabled: boolean;
  type: SwitchType;
  trigger: number; // Increment this to play sound
}

const TypingAudio: React.FC<TypingAudioProps> = ({ enabled, type, trigger }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      // Don't close immediately to avoid pops, but clean up on unmount
    };
  }, [enabled]);

  const playClick = useCallback(() => {
    if (!enabled || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Presets for different switches
    switch (type) {
      case 'blue': // Clicky
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        break;
      case 'brown': // Tactile (Thocky)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        break;
      case 'red': // Linear (Soft)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200 + Math.random() * 50, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        break;
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, [enabled, type]);

  useEffect(() => {
    if (trigger > 0) {
      playClick();
    }
  }, [trigger, playClick]);

  return null; // Side-effect only component
};

export default TypingAudio;
