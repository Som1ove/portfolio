import { NavLink } from 'react-router-dom';

export default function FooterNav({ sections }) {
  return (
    <footer className="footer-nav" aria-label="Portfolio sections">
      {sections.map((section) => (
        <NavLink key={section.path} to={section.path} className={`footer-card footer-card-${section.kicker.toLowerCase().replace(/\s+/g, '-')}`}>
          <span>{section.kicker}</span>
          <strong>{section.title}</strong>
          <small>{section.subtitle}</small>
        </NavLink>
      ))}
    </footer>
  );
}
