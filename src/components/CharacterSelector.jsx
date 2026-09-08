import React from 'react';

const styles = {
  container: { marginBottom: '16px' },
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px',
  },
  count: { fontSize: '13px', color: '#6c757d' },
  actions: { display: 'flex', gap: '8px' },
  btn: {
    padding: '4px 12px', fontSize: '12px', border: '1px solid #dee2e6',
    borderRadius: '4px', background: '#fff', cursor: 'pointer',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '8px', maxHeight: '300px', overflowY: 'auto',
  },
  card: {
    padding: '12px 8px', border: '2px solid #dee2e6', borderRadius: '8px',
    textAlign: 'center', cursor: 'pointer', fontSize: '24px', fontWeight: 500,
    background: '#fff', transition: 'all 0.15s', userSelect: 'none',
  },
  cardSelected: { borderColor: '#0d6efd', background: '#e7f1ff' },
  empty: { textAlign: 'center', padding: '24px', color: '#6c757d', fontSize: '14px' },
};

export default function CharacterSelector({ characters, selectedCharacters, onToggleCharacter, onSelectAll, onDeselectAll }) {
  if (!characters || characters.length === 0) {
    return <div style={styles.empty}>该课文暂无生字数据</div>;
  }

  const allSelected = selectedCharacters.size === characters.length;

  return (
    <div style={styles.container} className="character-selector">
      <div style={styles.toolbar}>
        <span style={styles.count}>已选 {selectedCharacters.size} / {characters.length}</span>
        <div style={styles.actions}>
          <button style={styles.btn} onClick={onSelectAll} disabled={allSelected}>全选</button>
          <button style={styles.btn} onClick={onDeselectAll} disabled={selectedCharacters.size === 0}>取消全选</button>
        </div>
      </div>
      <div style={styles.grid}>
        {characters.map((ch) => {
          const isSelected = selectedCharacters.has(ch);
          return (
            <div
              key={ch}
              className={`char-card ${isSelected ? 'selected' : ''}`}
              style={{ ...styles.card, ...(isSelected ? styles.cardSelected : {}) }}
              onClick={() => onToggleCharacter(ch)}
            >
              {ch}
            </div>
          );
        })}
      </div>
    </div>
  );
}
