import React from 'react';

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', border: '1px solid #dee2e6', borderRadius: '8px',
    cursor: 'pointer', background: '#fff', transition: 'all 0.15s',
  },
  itemSelected: { borderColor: '#0d6efd', background: '#e7f1ff', fontWeight: 600 },
  title: { fontSize: '14px', fontWeight: 500 },
  badge: { fontSize: '11px', color: '#6c757d', background: '#e9ecef', padding: '2px 8px', borderRadius: '12px' },
  empty: { textAlign: 'center', padding: '24px', color: '#6c757d', fontSize: '14px' },
};

export default function LessonList({ lessons, selectedLesson, onSelectLesson }) {
  if (!lessons || lessons.length === 0) {
    return <div style={styles.empty}>该单元暂无课文，请选择其他单元</div>;
  }

  return (
    <div style={styles.list} className="lesson-list">
      {lessons.map((lesson) => {
        const isSelected = selectedLesson?.id === lesson.id;
        return (
          <div
            key={lesson.id}
            className={`lesson-item ${isSelected ? 'selected' : ''}`}
            style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
            onClick={() => onSelectLesson(lesson)}
          >
            <span style={styles.title}>{lesson.title}</span>
            {lesson.characterCount && <span style={styles.badge}>{lesson.characterCount}字</span>}
          </div>
        );
      })}
    </div>
  );
}
