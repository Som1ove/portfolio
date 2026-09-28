import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DraggableCartridge from '../components/DraggableCartridge.jsx';
import GameBoyConsole from '../components/GameBoyConsole.jsx';
import HeroTitle from '../components/HeroTitle.jsx';

const ASSET_ROOT = `${import.meta.env.BASE_URL}assets`;

const cartridges = [
  {
    id: 'pokemon',
    title: 'GAME DEV',
    game: 'POKEMON',
    kicker: '001',
    year: 'LEVELS',
    route: '/game-dev',
    rotation: -8,
    labelImage: `${ASSET_ROOT}/cartridges/labels/pokemon.webp`,
    shell: 'yellow',
  },
  {
    id: 'zelda',
    title: 'PHOTO',
    game: 'ZELDA',
    kicker: '002',
    year: 'NEON',
    route: '/photography',
    rotation: 6,
    labelImage: `${ASSET_ROOT}/cartridges/labels/zelda.webp`,
    shell: 'green',
  },
  {
    id: 'kirby',
    title: 'ILLUST',
    game: 'KIRBY',
    kicker: '003',
    year: 'POSTER',
    route: '/illustration',
    rotation: -2,
    labelImage: `${ASSET_ROOT}/cartridges/labels/kirby.webp`,
    shell: 'gray',
  },
];

export default function Home() {
  const sceneRef = useRef(null);
  const dropRef = useRef(null);
  const startTimerRef = useRef(null);
  const [dropArmed, setDropArmed] = useState(false);
  const [loadedCartridge, setLoadedCartridge] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const sendCartridge = (cartridge, cartridgeRect) => {
    setDropArmed(false);

    const target = dropRef.current;

    if (!target || !cartridgeRect) return;

    const rect = target.getBoundingClientRect();
    const overlapX = Math.max(0, Math.min(cartridgeRect.right, rect.right) - Math.max(cartridgeRect.left, rect.left));
    const overlapY = Math.max(0, Math.min(cartridgeRect.bottom, rect.bottom) - Math.max(cartridgeRect.top, rect.top));
    const overlapArea = overlapX * overlapY;
    const cartridgeArea = cartridgeRect.width * cartridgeRect.height;
    const isInside = overlapArea > cartridgeArea * 0.18;

    if (isInside) {
      setLoadedCartridge(cartridge);
    }
  };

  const startGame = () => {
    if (!loadedCartridge || isStarting) return;

    setIsStarting(true);
    startTimerRef.current = window.setTimeout(
      () => navigate(loadedCartridge.route),
      reduceMotion ? 120 : 1050,
    );
  };

  useEffect(() => () => {
    if (startTimerRef.current) {
      window.clearTimeout(startTimerRef.current);
    }
  }, []);

  return (
    <section className="home-page" ref={sceneRef}>
      <HeroTitle />

      <motion.div
        className="hero-callout"
        initial={reduceMotion ? false : { opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.42 }}
      >
        Insert a cartridge to enter my game world.
        <span aria-hidden="true" />
      </motion.div>

      <motion.p
        className="hero-helper"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4 }}
      >
        DRAG A 3D CARTRIDGE UP TO INSERT.<br />
        PRESS START TO LOAD A PORTFOLIO WORLD.
      </motion.p>

      <motion.button
        className={`retro-panel panel-left insert-panel${loadedCartridge ? ' is-ready' : ''}`}
        type="button"
        disabled={!loadedCartridge || isStarting}
        onClick={startGame}
        initial={reduceMotion ? false : { opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={loadedCartridge && !isStarting ? { scale: 0.97 } : undefined}
        transition={{ delay: 0.16, duration: 0.45 }}
        aria-label={loadedCartridge ? `Start ${loadedCartridge.title}` : 'Drag a cartridge into the Game Boy'}
      >
        <span>{loadedCartridge ? 'START' : 'INSERT'}</span>
        <strong>{loadedCartridge ? 'START GAME' : 'SELECT CART'}</strong>
        <small>{loadedCartridge ? `${loadedCartridge.game} READY` : 'DROP CART INTO GAME BOY'}</small>
      </motion.button>

      <div className="interactive-zone">
        <GameBoyConsole dropRef={dropRef} isArmed={dropArmed} cartridge={loadedCartridge} />
        <div className="cartridge-rack" aria-label="Draggable project cartridges">
          {cartridges.map((cartridge, index) => (
            <DraggableCartridge
              key={cartridge.title}
              cartridge={cartridge}
              constraintsRef={sceneRef}
              index={index}
              isInserted={loadedCartridge?.id === cartridge.id}
              onDrop={sendCartridge}
              onDragStart={() => setDropArmed(true)}
              onDragCancel={() => setDropArmed(false)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isStarting && loadedCartridge ? (
          <motion.div
            className={`boot-transition boot-${loadedCartridge.id}`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-live="assertive"
          >
            <motion.div
              className="boot-card"
              initial={reduceMotion ? false : { y: 36, scale: 0.94 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            >
              <span>NOW LOADING</span>
              <strong>{loadedCartridge.title}</strong>
              <small>{loadedCartridge.game} / {loadedCartridge.year}</small>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
