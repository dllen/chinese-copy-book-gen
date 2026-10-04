import React from 'react';

export default function Section({ title, description, children, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return React.createElement('div', { className: 'section-card mb-3' },
    React.createElement('button', {
      className: 'section-header',
      type: 'button',
      'aria-expanded': open,
      onClick: () => setOpen(!open)
    },
      React.createElement('span', { className: 'section-title' }, title),
      React.createElement('span', { className: 'section-chevron' }, open ? '−' : '+')
    ),
    open ? React.createElement('div', { className: 'section-body' },
      description ? React.createElement('p', { className: 'section-description' }, description) : null,
      children
    ) : null
  );
}
