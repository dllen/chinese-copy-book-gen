import React from 'react';

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#fff',
    transition: 'all 0.15s',
    fontSize: '14px',
  },
  itemSelected: { borderColor: '#0d6efd', background: '#e7f1ff', fontWeight: 600 },
  icon: { fontSize: '18px' },
};

export default function UnitList({ units, selectedUnit, onSelect }) {
  return (
    <div style={styles.container} className="unit-list">
      {units.map((unit) => {
        const isSelected = selectedUnit === unit.id;
        return (
          <div
            key={unit.id}
            className={`unit-item ${isSelected ? 'selected' : ''}`}
            style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
            onClick={() => onSelect(unit.id)}
          >
            <span style={styles.icon}>{unit.icon}</span>
            <span>{unit.name}</span>
          </div>
        );
      })}
    </div>
  );
}
