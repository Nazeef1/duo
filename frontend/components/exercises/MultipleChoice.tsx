'use client';

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
}

export default function MultipleChoice({ data, selectedAnswer, onChange, disabled, isChecked, isCorrect }: MultipleChoiceProps) {
  return (
    <div>
      <h3 className="exercise-prompt">{data.prompt}</h3>
      <div className="mc-grid">
        {data.options.map((option, idx) => {
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
              onClick={() => onChange(option)}
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
