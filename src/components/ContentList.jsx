import React from 'react';

const styles = {
  search: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' },
  item: {
    padding: '10px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#fff',
    transition: 'all 0.15s',
  },
  itemSelected: { borderColor: '#0d6efd', background: '#e7f1ff' },
  title: { fontSize: '14px', fontWeight: 500 },
  preview: { fontSize: '12px', color: '#6c757d', marginTop: '4px' },
};

export default function ContentList({ contents, selectedContent, onSelect, onSearch }) {
  return (
    <div className="content-list">
      {onSearch && (
        <input
          style={styles.search}
          type="text"
          placeholder="搜索课文、词语..."
          onChange={(e) => onSearch(e.target.value)}
        />
      )}
      <div style={styles.list}>
        {contents.map((item) => {
          const isSelected = selectedContent?.id === item.id;
          return (
            <div
              key={item.id}
              className={`content-item ${isSelected ? 'selected' : ''}`}
              style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
              onClick={() => onSelect(item)}
            >
              <div style={styles.title}>{item.title}</div>
              {item.characters && (
                <div style={styles.preview}>{item.characters.slice(0, 8).join(' ')}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
