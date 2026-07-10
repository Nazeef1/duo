'use client';

interface UnitHeaderProps {
  title: string;
  index: number;
}

export default function UnitHeader({ title, index }: UnitHeaderProps) {
  // Use different background colors for units to make the design rich
  const colors = [
    { bg: 'var(--color-green)', border: 'var(--color-green-dark)' },
    { bg: 'var(--color-purple)', border: 'var(--color-purple-dark)' },
    { bg: 'var(--color-blue)', border: 'var(--color-blue-dark)' },
  ];
  
  const activeColor = colors[index % colors.length];

  return (
    <div 
      className="unit-header"
      style={{ 
        backgroundColor: activeColor.bg,
        borderBottomColor: activeColor.border
      }}
    >
      <h3 className="unit-header-title">Unit {index + 1}</h3>
      <p className="unit-header-subtitle">{title}</p>
    </div>
  );
}
