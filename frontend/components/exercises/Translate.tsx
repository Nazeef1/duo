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
}

export default function Translate({ data, selectedAnswer, onChange, disabled }: TranslateProps) {
  // Store selected word bank indices
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Sync internal state if selectedAnswer is reset by parent
  useEffect(() => {
    if (!selectedAnswer || selectedAnswer.length === 0) {
      setSelectedIndices([]);
    }
  }, [selectedAnswer]);

  const handleWordTap = (bankIdx: number) => {
    if (disabled) return;
    if (selectedIndices.includes(bankIdx)) return;

    const nextIndices = [...selectedIndices, bankIdx];
    setSelectedIndices(nextIndices);
    onChange(nextIndices.map(idx => data.word_bank[idx]));
  };

  const handleSlotTap = (slotIdx: number) => {
    if (disabled) return;

    const nextIndices = selectedIndices.filter((_, idx) => idx !== slotIdx);
    setSelectedIndices(nextIndices);
    onChange(nextIndices.map(idx => data.word_bank[idx]));
  };

  return (
    <div>
      <h3 className="exercise-prompt">{data.prompt}</h3>
      
      {/* Active Slots (Target Area) */}
      <div className="translate-slots">
        {selectedIndices.map((bankIdx, slotIdx) => (
          <button
            key={`${slotIdx}-${bankIdx}`}
            type="button"
            disabled={disabled}
            onClick={() => handleSlotTap(slotIdx)}
            className="tap-word-btn"
          >
            {data.word_bank[bankIdx]}
          </button>
        ))}
        {selectedIndices.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '16px', fontStyle: 'italic', alignSelf: 'center', marginLeft: '8px' }}>
            Tap words to build your answer
          </span>
        )}
      </div>

      {/* Word Bank (Source Area) */}
      <div className="word-bank">
        {data.word_bank.map((word, idx) => {
          const isUsed = selectedIndices.includes(idx);
          return (
            <button
              key={`${word}-${idx}`}
              type="button"
              disabled={disabled || isUsed}
              onClick={() => handleWordTap(idx)}
              className={`tap-word-btn ${isUsed ? 'disabled' : ''}`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
