'use client';

import { useState, useEffect } from 'react';

interface MatchPairsProps {
  data: {
    prompt: string;
    pairs: [string, string][];
  };
  selectedAnswer: boolean | null;
  onChange: (matched: boolean) => void;
  disabled: boolean;
}

export default function MatchPairs({ data, selectedAnswer, onChange, disabled }: MatchPairsProps) {
  const [leftWords, setLeftWords] = useState<string[]>([]);
  const [rightWords, setRightWords] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<[string, string][]>([]);
  const [failedPair, setFailedPair] = useState<[string, string] | null>(null);

  // Shuffle columns once on mount
  useEffect(() => {
    const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);
    setLeftWords(shuffle(data.pairs.map(p => p[0])));
    setRightWords(shuffle(data.pairs.map(p => p[1])));
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setFailedPair(null);
  }, [data.pairs]);

  // Handle checking match when both are selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      // Find if this pair is correct
      const isMatch = data.pairs.some(
        pair => pair[0] === selectedLeft && pair[1] === selectedRight
      );

      if (isMatch) {
        const nextMatched = [...matchedPairs, [selectedLeft, selectedRight] as [string, string]];
        setMatchedPairs(nextMatched);
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all matched
        if (nextMatched.length === data.pairs.length) {
          onChange(true);
        }
      } else {
        setFailedPair([selectedLeft, selectedRight]);
        const timer = setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setFailedPair(null);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLeft, selectedRight, data.pairs, matchedPairs, onChange]);

  const handleLeftClick = (word: string) => {
    if (disabled || failedPair) return;
    if (matchedPairs.some(p => p[0] === word)) return;
    setSelectedLeft(word);
  };

  const handleRightClick = (word: string) => {
    if (disabled || failedPair) return;
    if (matchedPairs.some(p => p[1] === word)) return;
    setSelectedRight(word);
  };

  return (
    <div>
      <h3 className="exercise-prompt">{data.prompt}</h3>
      <div className="match-pairs-container">
        {/* Left Column (Spanish) */}
        <div className="match-column">
          {leftWords.map(word => {
            const isSelected = selectedLeft === word;
            const isMatched = matchedPairs.some(p => p[0] === word);
            const isFailed = failedPair && failedPair[0] === word;
            
            let btnClass = '';
            if (isMatched) btnClass = 'matched';
            else if (isFailed) btnClass = 'failed';
            else if (isSelected) btnClass = 'selected';

            return (
              <button
                key={`left-${word}`}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleLeftClick(word)}
                className={`match-btn ${btnClass}`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Right Column (English) */}
        <div className="match-column">
          {rightWords.map(word => {
            const isSelected = selectedRight === word;
            const isMatched = matchedPairs.some(p => p[1] === word);
            const isFailed = failedPair && failedPair[1] === word;
            
            let btnClass = '';
            if (isMatched) btnClass = 'matched';
            else if (isFailed) btnClass = 'failed';
            else if (isSelected) btnClass = 'selected';

            return (
              <button
                key={`right-${word}`}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleRightClick(word)}
                className={`match-btn ${btnClass}`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
