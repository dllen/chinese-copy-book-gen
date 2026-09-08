import React from 'react';

const SUBJECTS = [
  { id: '语文', name: '语文', icon: '📖', desc: '生字、词语、古诗' },
  { id: '英语', name: '英语', icon: '🔤', desc: '字母、单词、句子' },
];

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
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
  },
  cardSelected: { borderColor: '#0d6efd', background: '#e7f1ff' },
  icon: { fontSize: '28px', marginBottom: '8px' },
  name: { fontSize: '15px', fontWeight: 600 },
  desc: { fontSize: '12px', color: '#6c757d', marginTop: '4px' },
};

export default function SubjectSelector({ gradeId, selectedSubject, onSelectSubject }) {
  const showEnglish = ['g3', 'g4', 'g5', 'g6'].includes(gradeId);
  const availableSubjects = showEnglish ? SUBJECTS : SUBJECTS.filter(s => s.id === '语文');

  return (
    <div style={styles.grid} className="subject-selector">
      {availableSubjects.map((subject) => {
        const isSelected = selectedSubject === subject.id;
        return (
          <div
            key={subject.id}
            className={`subject-card ${isSelected ? 'selected' : ''}`}
            style={{ ...styles.card, ...(isSelected ? styles.cardSelected : {}) }}
            onClick={() => onSelectSubject(subject.id)}
          >
            <div style={styles.icon}>{subject.icon}</div>
            <div style={styles.name}>{subject.name}</div>
            <div style={styles.desc}>{subject.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
