import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import './SplashScreen.css';
import logo from '../../assets/logo-2.png';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete(), 600);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          id="splash-screen"
          className="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.img
            src={logo}
            alt="Meu Mural"
            id="mm-logo"
            className="splash-logo"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.span
            id="mm-titulo"
            className="splash-titulo"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
          >
            <span className="mm-azul"><b>M</b></span><small>eu</small>{" "}
            <span className="mm-verde"><b>M</b></span><small>ural</small>
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
