import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header" aria-label="Primary">
      <NavLink to="/" className="brand-mark" aria-label="Som1ove home">
        <span />
      </NavLink>
      <div className="header-cell header-role">GAME DESIGNER / ARTIST / PHOTOGRAPHER</div>
      <div className="header-cell header-welcome">WELCOME TO MY GAME WORLD</div>
      <div className="header-cell header-slash">///</div>
      <div className="header-cell header-portfolio">PORTFOLIO</div>
      <div className="header-version" aria-label="Version 2.2 2026">
        <small>VERSION</small>
        <strong>2.2</strong>
        <span>2026</span>
      </div>
    </header>
  );
}
