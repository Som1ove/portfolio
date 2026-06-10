import { motion, useReducedMotion } from 'framer-motion';

export default function HeroTitle() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="hero-title"
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="home-title"
    >
      <p className="hero-kicker">KINETIC TYPE · REAL 3D CONSOLE · 3D CARTRIDGES</p>
      <h1 id="home-title">
        <span>Som1ove's</span>
        <span>Game World</span>
      </h1>
    </motion.section>
  );
}
