import React from 'react';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  card: {
    padding: '20px 16px',
    border: '2px solid #dee2e6',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#fff',
    userSelect: 'none',
    minHeight: '44px',
    boxSizing: 'border-box',
  },
  cardHover: { borderColor: '#0d6efd', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(13,110,253,0.15)' },
  cardSelected: { borderColor: '#0d6efd', background: '#e7f1ff', boxShadow: '0 2px 8px rgba(13,110,253,0.2)' },
  icon: { fontSize: '28px', marginBottom: '8px' },
  name: { fontSize: '15px', fontWeight: 600, color: '#333' },
};

export default function GradeSelector({ grades, selectedGrade, onSelect }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .grade-selector {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      <div style={styles.grid} className="grade-selector">
        {grades.map((grade) => {
          const isSelected = selectedGrade === grade.id;
          const isHovered = hovered === grade.id;
          return (
            <div
              key={grade.id}
              className={`grade-card ${isSelected ? 'selected' : ''}`}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {}),
                ...(isHovered && !isSelected ? styles.cardHover : {}),
              }}
              onClick={() => onSelect(grade.id)}
              onMouseEnter={() => setHovered(grade.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={styles.icon}>{grade.icon || '📚'}</div>
              <div style={styles.name}>{grade.name}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
