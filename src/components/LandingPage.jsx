import React from 'react';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeatureCards from './FeatureCards';
import WorkflowSection from './WorkflowSection';
import UseCasesSection from './UseCasesSection';
import SiteFooter from './SiteFooter';

export default function LandingPage({ onStartBuilder, onNavigate }) {
  return React.createElement(
    'div',
    { className: 'landing-page' },
    React.createElement(HeroSection, { onStartBuilder }),
    React.createElement(StatsSection),
    React.createElement(FeatureCards, { onSelect: onStartBuilder }),
    React.createElement(WorkflowSection, { onStartBuilder, onNavigate }),
    React.createElement(UseCasesSection),
    React.createElement(
      'section',
      { className: 'final-cta' },
      React.createElement('h2', null, '现在开始制作一份专属字帖'),
      React.createElement('p', null, '选择内容、调整样式，然后直接打印。'),
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'btn-gradient-primary',
          onClick: () => onStartBuilder?.('hanzi'),
        },
        '进入字帖工作台'
      )
    ),
    React.createElement(SiteFooter, { onNavigate })
  );
}
