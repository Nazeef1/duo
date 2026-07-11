'use client';

import { Exercise } from '@/lib/types';
import MultipleChoice from '../exercises/MultipleChoice';
import Translate from '../exercises/Translate';
import MatchPairs from '../exercises/MatchPairs';
import FillBlank from '../exercises/FillBlank';
import TypeAnswer from '../exercises/TypeAnswer';

interface ExerciseRendererProps {
  exercise: Exercise;
  selectedAnswer: any;
  onChange: (val: any) => void;
  disabled: boolean;
  isChecked?: boolean;
  isCorrect?: boolean;
  onSpeak?: (text: string, lang?: 'es' | 'en') => void;
}

export default function ExerciseRenderer({ exercise, selectedAnswer, onChange, disabled, isChecked, isCorrect, onSpeak }: ExerciseRendererProps) {
  switch (exercise.type) {
    case 'multiple_choice':
      return (
        <MultipleChoice
          data={exercise.data}
          selectedAnswer={selectedAnswer}
          onChange={onChange}
          disabled={disabled}
          isChecked={isChecked}
          isCorrect={isCorrect}
          onSpeak={onSpeak}
        />
      );
    case 'translate':
      return (
        <Translate
          data={exercise.data}
          selectedAnswer={selectedAnswer}
          onChange={onChange}
          disabled={disabled}
          onSpeak={onSpeak}
        />
      );
    case 'match_pairs':
      return (
        <MatchPairs
          data={exercise.data}
          selectedAnswer={selectedAnswer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'fill_blank':
      return (
        <FillBlank
          data={exercise.data}
          selectedAnswer={selectedAnswer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'type_answer':
      return (
        <TypeAnswer
          data={exercise.data}
          selectedAnswer={selectedAnswer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    default:
      return (
        <div style={{ color: 'red', fontWeight: 800 }}>
          Unknown exercise type: {exercise.type}
        </div>
      );
  }
}
