'use client';

interface TypeAnswerProps {
  data: {
    prompt: string;
  };
  selectedAnswer: string | null;
  onChange: (answer: string) => void;
  disabled: boolean;
}

export default function TypeAnswer({ data, selectedAnswer, onChange, disabled }: TypeAnswerProps) {
  return (
    <div>
      <h3 className="exercise-prompt">{data.prompt}</h3>
      <input
        type="text"
        disabled={disabled}
        value={selectedAnswer || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type translation here..."
        className="type-answer-input"
        autoFocus
      />
    </div>
  );
}
