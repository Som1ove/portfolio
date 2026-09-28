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
  const insertionLockRef = useRef(false);
  const [dropArmed, setDropArmed] = useState(false);
  const [loadedCartridge, setLoadedCartridge] = useState(null);
  const [insertion, setInsertion] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const insertCartridge = (cartridge, sourceRect) => {
    if (insertionLockRef.current || !sourceRect || !dropRef.current) return;

    const targetRect = dropRef.current.getBoundingClientRect();
    insertionLockRef.current = true;
    setDropArmed(false);
    setInsertion({
      cartridge,
      source: {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
      },
      target: {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      },
      key: `${cartridge.id}-${window.performance.now()}`,
    });
  };

  const completeInsertion = (cartridge) => {
    setLoadedCartridge(cartridge);
    setInsertion(null);
    insertionLockRef.current = false;
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
        DRAG OR CLICK A CARTRIDGE TO INSERT.<br />
        PRESS START TO LOAD A PORTFOLIO WORLD.
      </motion.p>

      <motion.button
        className={`retro-panel panel-left insert-panel${loadedCartridge && !insertion ? ' is-ready' : ''}${insertion ? ' is-inserting' : ''}`}
        type="button"
        disabled={!loadedCartridge || Boolean(insertion) || isStarting}
        onClick={startGame}
        initial={reduceMotion ? false : { opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={loadedCartridge && !isStarting ? { scale: 0.97 } : undefined}
        transition={{ delay: 0.16, duration: 0.45 }}
        aria-label={insertion
          ? `Inserting ${insertion.cartridge.title}`
          : loadedCartridge
            ? `Start ${loadedCartridge.title}`
            : 'Drag a cartridge into the Game Boy'}
        aria-live="polite"
      >
        <span>{insertion ? 'INSERTING' : loadedCartridge ? 'START' : 'INSERT'}</span>
        <strong>{insertion ? 'LOADING CART' : loadedCartridge ? 'START GAME' : 'SELECT CART'}</strong>
        <small>{insertion
          ? `${insertion.cartridge.game} → GAME BOY`
          : loadedCartridge
            ? `${loadedCartridge.game} READY`
            : 'DROP CART INTO GAME BOY'}</small>
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
              isInserted={loadedCartridge?.id === cartridge.id || insertion?.cartridge.id === cartridge.id}
              onDrop={insertCartridge}
              onDragStart={() => setDropArmed(true)}
              onDragCancel={() => setDropArmed(false)}
              onActivate={insertCartridge}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {insertion ? (
          <motion.div
            key={insertion.key}
            className="insertion-cartridge"
            style={{
              width: insertion.source.width,
              height: insertion.source.height,
            }}
            initial={{
              x: insertion.source.left,
              y: insertion.source.top,
              rotate: insertion.cartridge.rotation,
              scale: 1,
              opacity: 1,
            }}
            animate={reduceMotion
              ? {
                  x: insertion.target.left + insertion.target.width / 2 - insertion.source.width / 2,
                  y: insertion.target.top,
                  scale: 0.62,
                  opacity: 0,
                }
              : {
                  x: [
                    insertion.source.left,
                    insertion.target.left + insertion.target.width / 2 - insertion.source.width / 2,
                    insertion.target.left + insertion.target.width / 2 - insertion.source.width / 2,
                  ],
                  y: [
                    insertion.source.top,
                    insertion.target.top - insertion.source.height * 0.62,
                    insertion.target.top + insertion.target.height * 0.34,
                  ],
                  rotate: [insertion.cartridge.rotation, 0, 0],
                  scale: [1, 0.72, 0.56],
                  opacity: [1, 1, 0],
                }}
            transition={reduceMotion
              ? { duration: 0.16, ease: 'easeOut' }
              : {
                  duration: 0.58,
                  times: [0, 0.68, 1],
                  ease: [[0.22, 1, 0.36, 1], [0.4, 0, 1, 1]],
                }}
            onAnimationComplete={() => completeInsertion(insertion.cartridge)}
            aria-hidden="true"
          >
            <div className={`cartridge-front shell-${insertion.cartridge.shell}`}>
              <div className="cartridge-ridges" />
              <div className="cartridge-emboss">Nintendo GAME BOY</div>
              <div className="cartridge-art-frame">
                <img src={insertion.cartridge.labelImage} alt="" draggable="false" />
              </div>
              <div className="cartridge-arrow" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
