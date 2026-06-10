import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import FooterNav from './components/FooterNav.jsx';
import Home from './pages/Home.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

const sections = [
  {
    path: '/game-dev',
    title: 'Game Development',
    kicker: 'GAME DEV',
    subtitle: 'INDIE GAMES',
    description: 'Interactive prototypes, level pacing, pixel UI, and playful systems you can actually touch.',
  },
  {
    path: '/photography',
    title: 'Photography',
    kicker: 'PHOTO',
    subtitle: 'PHOTOGRAPHY',
    description: 'Street neon, character moments, travel fragments, and cinematic observations.',
  },
  {
    path: '/illustration',
    title: 'Illustration',
    kicker: 'ILLUST',
    subtitle: 'ILLUSTRATION',
    description: 'Character design, poster art, retro packaging, and visual fragments from imagined worlds.',
  },
];

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home sections={sections} />} />
          {sections.map((section) => (
            <Route
              key={section.path}
              path={section.path}
              element={<PlaceholderPage section={section} />}
            />
          ))}
        </Routes>
      </main>
      {!isHome ? <FooterNav sections={sections} /> : null}
    </div>
  );
}
