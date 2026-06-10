import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PlaceholderPage({ section }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="placeholder-page">
      <motion.div
        className="placeholder-panel"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <p>{section.kicker}</p>
        <h1>{section.title}</h1>
        <span>{section.description}</span>
        <Link to="/">BACK TO HOME</Link>
      </motion.div>
    </section>
  );
}
