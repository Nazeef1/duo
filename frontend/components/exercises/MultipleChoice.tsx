import { useState, useEffect } from 'react';

interface MultipleChoiceProps {
  data: {
    prompt: string;
    options: string[];
    correct?: string; // optional: the correct answer to highlight after checking
  };
  selectedAnswer: string | null;
  onChange: (answer: string) => void;
  disabled: boolean;
  isChecked?: boolean;
  isCorrect?: boolean;
  onSpeak?: (text: string, lang?: 'es' | 'en') => void;
}

export default function MultipleChoice({ data, selectedAnswer, onChange, disabled, isChecked, isCorrect, onSpeak }: MultipleChoiceProps) {
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
        <h3 className="exercise-prompt">{data.prompt}</h3>
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
      <h3 className="exercise-prompt">{data.prompt}</h3>
      <div className="mc-grid">
        {shuffledOptions.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          
          // Determine visual state
          let stateClass = '';
          if (isChecked && isSelected) {
            stateClass = isCorrect ? 'correct' : 'incorrect';
          } else if (isChecked && data.correct && option === data.correct && !isCorrect) {
            // Highlight the correct answer when user got it wrong
            stateClass = 'correct';
          } else if (!isChecked && isSelected) {
            stateClass = 'selected';
          }
          
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(option);
                onSpeak?.(option, 'es');
              }}
              className={`mc-option ${stateClass}`}
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
