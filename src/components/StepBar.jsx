import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    padding: '14px 0',
    marginBottom: '12px',
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    cursor: 'pointer',
    color: '#9ca3af',
    fontWeight: 500,
    fontSize: '13px',
    transition: 'color 0.2s',
    borderRadius: '6px',
  },
  stepActive: { color: '#111827', fontWeight: 600 },
  stepCompleted: { color: '#059669', cursor: 'pointer' },
  circle: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    background: '#f3f4f6',
    color: '#9ca3af',
    flexShrink: 0,
    transition: 'all 0.25s ease',
  },
  circleActive: { background: '#111827', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
  circleCompleted: { background: '#059669', color: '#fff' },
  connector: {
    width: '36px',
    height: '2px',
    background: '#e5e7eb',
    flexShrink: 0,
    borderRadius: '1px',
    transition: 'background 0.3s ease',
  },
  connectorCompleted: { background: '#059669' },
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
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'step' : undefined}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onStepClick?.(i); }}
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
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
