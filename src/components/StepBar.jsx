import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    padding: '16px 0',
    marginBottom: '12px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    cursor: 'pointer',
    color: '#6c757d',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  stepActive: { color: '#0d6efd', fontWeight: 700 },
  stepCompleted: { color: '#198754' },
  circle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    background: '#e9ecef',
    color: '#6c757d',
    flexShrink: 0,
  },
  circleActive: { background: '#0d6efd', color: '#fff' },
  circleCompleted: { background: '#198754', color: '#fff' },
  connector: {
    width: '40px',
    height: '2px',
    background: '#dee2e6',
    flexShrink: 0,
  },
  connectorCompleted: { background: '#198754' },
};

export default function StepBar({ steps, currentStep, onStepClick }) {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .step-bar .step-label { display: none; }
          .step-bar .step-item { padding: 4px 8px; }
          .step-bar .connector { width: 20px; }
        }
      `}</style>
      <div style={styles.wrapper} className="step-bar" role="navigation" aria-label="步骤导航">
        {steps.map((label, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <React.Fragment key={label}>
              <div
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                style={{ ...styles.step, ...(isActive ? styles.stepActive : {}), ...(isCompleted ? styles.stepCompleted : {}) }}
                onClick={() => onStepClick?.(i)}
              >
                <span
                  style={{
                    ...styles.circle,
                    ...(isActive ? styles.circleActive : {}),
                    ...(isCompleted ? styles.circleCompleted : {}),
                  }}
                >
                  {isCompleted ? '✓' : i + 1}
                </span>
                <span className="step-label">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="connector"
                  style={{
                    ...styles.connector,
                    ...(isCompleted ? styles.connectorCompleted : {}),
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
