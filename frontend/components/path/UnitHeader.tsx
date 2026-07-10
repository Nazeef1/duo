'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface UnitHeaderProps {
  title: string;
  index: number;
}

export default function UnitHeader({ title, index }: UnitHeaderProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  // Authentic guidebook tips seeded for Spanish units
  const tips = [
    {
      grammar: "Greetings in Spanish differ by time of day: 'Buenos días' (Morning), 'Buenas tardes' (Afternoon), and 'Buenas noches' (Evening). Remember that 'días' is masculine, while 'tardes' and 'noches' are feminine!",
      vocab: "hola (hello), gracias (thank you), adiós (goodbye), por favor (please)"
    },
    {
      grammar: "When talking about food or ordering at a café, use the verb 'querer' (to want). 'Yo quiero un café' means 'I want a coffee'. To be polite, add 'por favor' at the end!",
      vocab: "café (coffee), té (tea), leche (milk), la cuenta (the bill)"
    }
  ];

  const activeTip = tips[index % tips.length] || tips[0];

  const colors = [
    { bg: 'var(--color-blue-dark)', border: '#122533' },
    { bg: 'var(--color-purple-dark)', border: '#1f132e' },
    { bg: 'var(--color-green-dark)', border: '#1f2e13' },
  ];
  
  const activeColor = colors[index % colors.length];

  return (
    <>
      <div 
        className="unit-header"
        style={{ 
          backgroundColor: activeColor.bg,
          borderBottom: `6px solid ${activeColor.border}`
        }}
      >
        <div className="unit-header-info">
          <h3 className="unit-header-title">Unit {index + 1}</h3>
          <p className="unit-header-subtitle">{title}</p>
        </div>

        <button 
          onClick={() => setGuideOpen(!guideOpen)}
          className="btn-3d"
          style={{ 
            padding: '8px 16px', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: 'white'
          }}
        >
          <BookOpen size={16} />
          <span>{guideOpen ? 'Close' : 'Guidebook'}</span>
        </button>
      </div>

      {guideOpen && (
        <div className="guidebook-card">
          <h4 className="guidebook-section-title">Grammar Tips</h4>
          <p className="guidebook-text" style={{ marginBottom: '12px' }}>
            {activeTip.grammar}
          </p>
          <h4 className="guidebook-section-title">Key Vocabulary</h4>
          <p className="guidebook-text" style={{ fontWeight: 800 }}>
            {activeTip.vocab}
          </p>
        </div>
      )}
    </>
  );
}
