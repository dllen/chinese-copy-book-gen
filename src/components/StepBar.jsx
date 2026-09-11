import React from 'react';

export default function StepBar({ steps, currentStep, onStepClick }) {
  return React.createElement(
    'div',
    { className: 'step-bar', role: 'navigation', 'aria-label': '步骤导航' },
    steps.map((label, index) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep;
      return React.createElement(
        React.Fragment,
        { key: label },
        React.createElement(
          'button',
          {
            type: 'button',
            className: `step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`,
            'aria-current': isActive ? 'step' : undefined,
            'aria-label': label,
            onClick: () => onStepClick?.(index),
          },
          React.createElement(
            'span',
            { className: 'step-circle' },
            isCompleted ? '✓' : index + 1
          ),
          React.createElement('span', { className: 'step-label' }, label)
        ),
        index < steps.length - 1 && React.createElement('span', {
          className: `step-connector ${isCompleted ? 'completed' : ''}`,
          'aria-hidden': 'true',
        })
      );
    })
  );
}
