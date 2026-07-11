import { useState, useEffect } from 'react';

interface FillBlankProps {
  data: {
    prompt: string;
    options: string[];
  };
  selectedAnswer: string | null;
  onChange: (answer: string) => void;
  disabled: boolean;
}

export default function FillBlank({ data, selectedAnswer, onChange, disabled }: FillBlankProps) {
  // We can parse the prompt to show the blank filled.
  // The prompt usually contains "___"
  const promptParts = data.prompt.split('___');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (data.options) {
      // Robust Fisher-Yates shuffle algorithm
      const shuffled = [...data.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledOptions(shuffled);
    }
  }, [data.options]);

  if (!mounted) {
    return (
      <div>
        <h3 className="exercise-prompt">Fill in the blank:</h3>
        
        {/* Sentence display with dynamic blank */}
        <div className="fill-blank-text">
          {promptParts[0]}
          <span className="blank-slot">
            {selectedAnswer || '_____'}
          </span>
          {promptParts[1]}
        </div>

        <div className="mc-grid">
          {data.options.map((option, idx) => (
            <button key={option} type="button" disabled className="mc-option">
              <span className="mc-option-number">{idx + 1}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="exercise-prompt">Fill in the blank:</h3>
      
      {/* Sentence display with dynamic blank */}
      <div className="fill-blank-text">
        {promptParts[0]}
        <span className="blank-slot">
          {selectedAnswer || '_____'}
        </span>
        {promptParts[1]}
      </div>

      <div className="mc-grid">
        {shuffledOptions.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option)}
              className={`mc-option ${isSelected ? 'selected' : ''}`}
            >
              <span className="mc-option-number">{idx + 1}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
