import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeatureCards from './FeatureCards';
import Testimonials from './Testimonials';
import SiteFooter from './SiteFooter';

/**
 * LandingPage — Composes all landing sections above the builder.
 * Inspired by ziyouzt.com homepage layout.
 */
export default function LandingPage({ onStartBuilder, onNavigate }) {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(HeroSection, { onStartBuilder, onNavigate }),
    React.createElement(StatsSection),
    React.createElement(FeatureCards, { onSelect: onStartBuilder }),
    React.createElement(Testimonials),
    React.createElement(SiteFooter, { onNavigate })
  );
}
