'use client';

interface MultipleChoiceProps {
  data: {
    prompt: string;
    options: string[];
  };
  selectedAnswer: string | null;
  onChange: (answer: string) => void;
  disabled: boolean;
}

export default function MultipleChoice({ data, selectedAnswer, onChange, disabled }: MultipleChoiceProps) {
  return (
    <div>
      <h3 className="exercise-prompt">{data.prompt}</h3>
      <div className="mc-grid">
        {data.options.map((option, idx) => {
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
