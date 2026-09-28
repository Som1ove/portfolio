import { motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

export default function DraggableCartridge({
  cartridge,
  constraintsRef,
  index,
  isInserted = false,
  onDrop,
  onDragStart,
  onDragCancel,
  onActivate,
}) {
  const reduceMotion = useReducedMotion();
  const cartridgeRef = useRef(null);
  const pointerStartRef = useRef(null);
  const getShellRect = () => (
    cartridgeRef.current?.querySelector('.cartridge-front')?.getBoundingClientRect()
    ?? cartridgeRef.current?.getBoundingClientRect()
    ?? null
  );
  const activateCartridge = () => {
    if (!isInserted) onActivate?.(cartridge, getShellRect());
  };
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    activateCartridge();
  };
  const finishDrag = () => onDrop?.(cartridge, getShellRect());
  const rememberPointerStart = (event) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };
  const finishPointerGesture = (event) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || isInserted) return;

    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 6) {
      onDrop?.(cartridge, getShellRect());
    }
  };
  const cancelPointerGesture = () => {
    pointerStartRef.current = null;
    onDragCancel?.();
  };

  return (
    <motion.article
      ref={cartridgeRef}
      className={`cartridge cartridge-${index + 1}${isInserted ? ' is-inserted' : ''}`}
      drag={!isInserted}
      dragConstraints={constraintsRef}
      dragElastic={0.32}
      dragMomentum={false}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 260, bounceDamping: 24 }}
      whileDrag={reduceMotion
        ? { zIndex: 80 }
        : {
            scale: 1.035,
            rotate: index % 2 === 0 ? -1.5 : 1.5,
            zIndex: 80,
            transition: { type: 'spring', stiffness: 420, damping: 30, mass: 0.55 },
          }}
      whileHover={reduceMotion || isInserted ? undefined : { y: -6 }}
      initial={reduceMotion ? false : { opacity: 0, y: 32, rotate: cartridge.rotation }}
      animate={{
        opacity: isInserted ? 0 : 1,
        y: isInserted ? -20 : 0,
        rotate: cartridge.rotation,
        scale: isInserted ? 0.84 : 1,
      }}
      transition={reduceMotion
        ? { duration: 0 }
        : isInserted
          ? { duration: 0.16, ease: [0.4, 0, 1, 1] }
          : { delay: 0.24 + index * 0.08, type: 'spring', stiffness: 180, damping: 20 }}
      onDragStart={onDragStart}
      onDragEnd={finishDrag}
      onPointerDownCapture={rememberPointerStart}
      onPointerUpCapture={finishPointerGesture}
      onPointerCancel={cancelPointerGesture}
      onTap={activateCartridge}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isInserted ? -1 : 0}
      aria-hidden={isInserted}
      aria-label={`${cartridge.title}: drag to insert or press to select`}
    >
      <div className={`cartridge-front shell-${cartridge.shell}`}>
        <div className="cartridge-ridges" aria-hidden="true" />
        <div className="cartridge-emboss">Nintendo GAME BOY</div>
        <div className="cartridge-art-frame">
          <img src={cartridge.labelImage} alt="" draggable="false" />
        </div>
        <div className="cartridge-arrow" aria-hidden="true" />
      </div>
      <div className="cartridge-badge">
        <span>{cartridge.kicker}</span>
        <strong>{cartridge.title}</strong>
        <em>{cartridge.game}</em>
        <small>{cartridge.year}</small>
      </div>
    </motion.article>
  );
}
