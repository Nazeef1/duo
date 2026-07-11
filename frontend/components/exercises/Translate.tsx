'use client';

import { useEffect, useState } from 'react';

interface TranslateProps {
  data: {
    prompt: string;
    word_bank: string[];
  };
  selectedAnswer: string[] | null;
  onChange: (answer: string[]) => void;
  disabled: boolean;
  onSpeak?: (text: string, lang?: 'es' | 'en') => void;
}

export default function Translate({ data, selectedAnswer, onChange, disabled, onSpeak }: TranslateProps) {
  // Store selected word bank indices
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [shuffledWordBank, setShuffledWordBank] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Sync internal state if selectedAnswer is reset by parent
  useEffect(() => {
    if (!selectedAnswer || selectedAnswer.length === 0) {
      setSelectedIndices([]);
    }
  }, [selectedAnswer]);

  // Shuffle word bank on mount and when word_bank changes
  useEffect(() => {
    setMounted(true);
    if (data.word_bank) {
      const shuffled = [...data.word_bank];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledWordBank(shuffled);
    }
  }, [data.word_bank]);

  const handleWordTap = (bankIdx: number) => {
    if (disabled) return;
    if (selectedIndices.includes(bankIdx)) return;

    const nextIndices = [...selectedIndices, bankIdx];
    setSelectedIndices(nextIndices);
    onChange(nextIndices.map(idx => shuffledWordBank[idx]));
  };

  const handleSlotTap = (slotIdx: number) => {
    if (disabled) return;

    const nextIndices = selectedIndices.filter((_, idx) => idx !== slotIdx);
    setSelectedIndices(nextIndices);
    onChange(nextIndices.map(idx => shuffledWordBank[idx]));
  };

  if (!mounted) {
    return (
      <div>
        <h3 className="exercise-prompt" style={{ marginBottom: '24px' }}>Write this in English</h3>
        
        {/* Character + Speech bubble area */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            position: 'relative',
            backgroundColor: 'var(--bg-secondary)',
            border: '2px solid var(--border-color)',
            borderRadius: '16px',
            padding: '14px 20px',
            flex: 1,
            maxWidth: '400px',
            alignSelf: 'center'
          }}>
            <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-dark)' }}>
              {data.prompt}
            </span>
          </div>
        </div>

        <div className="word-bank" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px', justifyContent: 'center' }}>
          {data.word_bank.map((word, idx) => (
            <button key={`${word}-${idx}`} type="button" disabled className="tap-word-btn" style={{ opacity: 0.5 }}>
              {word}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="exercise-prompt" style={{ marginBottom: '24px' }}>Write this in English</h3>
      
      {/* Character + Speech bubble area (matches Duolingo style) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        {/* Character mascot */}
        <div style={{ flexShrink: 0 }}>
          {(() => {
            const CHARACTERS = [
              '/mascot/lily.jpg',
              '/mascot/Lucy.png',
              '/mascot/vikram.png',
              '/mascot/falstaff.png',
              '/mascot/girl.png',
              '/mascot/duo_study.png'
            ];
            const charIndex = data.prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CHARACTERS.length;
            const characterSrc = CHARACTERS[charIndex];
            return (
              <img
                src={characterSrc}
                alt="Character"
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--border-color)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            );
          })()}
        </div>

        {/* Speech bubble */}
        <div 
          onClick={() => onSpeak?.(data.prompt, 'es')}
          style={{
            position: 'relative',
            backgroundColor: 'var(--bg-secondary)',
            border: '2px solid var(--border-color)',
            borderRadius: '16px',
            padding: '14px 20px',
            flex: 1,
            maxWidth: '400px',
            cursor: 'pointer',
            alignSelf: 'center'
          }}
        >
          {/* Speech bubble tail pointing to the left */}
          <div style={{
            position: 'absolute',
            left: '-11px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '10px solid var(--border-color)',
          }} />
          <div style={{
            position: 'absolute',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderRight: '9px solid var(--bg-secondary)',
          }} />
          
          {/* Audio icon + Spanish text */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px'
          }}>
            <div style={{
              backgroundColor: 'var(--color-blue)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </div>
            <span style={{ 
              fontSize: '17px', 
              fontWeight: 700, 
              color: 'var(--text-dark)',
              borderBottom: '2px dashed var(--color-blue)',
              lineHeight: '1.4'
            }}>
              {data.prompt}
            </span>
          </div>
        </div>
      </div>

      {/* Active Slots (Target Area) */}
      <div className="translate-slots" style={{ position: 'relative', minHeight: '160px', marginTop: '24px', display: 'flex', flexDirection: 'column' }}>
        {/* 3 Horizontal Lines Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, borderBottom: '2px solid var(--border-color)' }}></div>
          <div style={{ flex: 1, borderBottom: '2px solid var(--border-color)' }}></div>
          <div style={{ flex: 1, borderBottom: '2px solid var(--border-color)' }}></div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 0' }}>
          {selectedIndices.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '16px', alignSelf: 'center', marginLeft: '8px', marginTop: '16px' }}>
              Tap words to build your answer
            </span>
          )}
          {selectedIndices.map((bankIdx, slotIdx) => (
            <button
              key={`${slotIdx}-${bankIdx}`}
              type="button"
              disabled={disabled}
              onClick={() => handleSlotTap(slotIdx)}
              className="tap-word-btn"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)',
                borderBottom: '4px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: disabled ? 'default' : 'pointer'
              }}
            >
              {shuffledWordBank[bankIdx]}
            </button>
          ))}
        </div>
      </div>

      {/* Word Bank (Source Area) */}
      <div className="word-bank" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px', justifyContent: 'center' }}>
        {shuffledWordBank.map((word, idx) => {
          const isUsed = selectedIndices.includes(idx);
          return (
            <button
              key={`${word}-${idx}`}
              type="button"
              disabled={disabled || isUsed}
              onClick={() => handleWordTap(idx)}
              className={`tap-word-btn ${isUsed ? 'disabled' : ''}`}
              style={{
                backgroundColor: isUsed ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                color: isUsed ? 'var(--text-muted)' : 'var(--text-dark)',
                border: isUsed ? '2px solid var(--border-color)' : '2px solid var(--border-color)',
                borderBottom: isUsed ? '2px solid var(--border-color)' : '4px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: disabled || isUsed ? 'default' : 'pointer',
                opacity: isUsed ? 0.3 : 1
              }}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
