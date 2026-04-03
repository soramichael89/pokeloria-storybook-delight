import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onAnimationComplete={(def: any) => {
        // Only trigger on exit
      }}
    >
      <motion.img
        src={logo}
        alt="PokéLoria"
        className="w-32 h-32 rounded-full drop-shadow-lg"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale: [0.7, 1.08, 0.96, 1],
          opacity: [0, 1, 1, 1],
        }}
        transition={{
          duration: 1.2,
          ease: 'easeOut',
          times: [0, 0.4, 0.7, 1],
        }}
        onAnimationComplete={() => {
          setTimeout(onFinish, 600);
        }}
      />
    </motion.div>
  );
};

export default SplashScreen;
