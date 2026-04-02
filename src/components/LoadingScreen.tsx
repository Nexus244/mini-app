import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 2,
}));

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menginisialisasi...');

  const steps = [
    { text: 'Menginisialisasi...', progress: 20 },
    { text: 'Memuat data produk...', progress: 45 },
    { text: 'Menyiapkan sistem...', progress: 70 },
    { text: 'Hampir selesai...', progress: 90 },
    { text: 'Selamat datang! 🚀', progress: 100 },
  ];

  useEffect(() => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setStatusText(steps[stepIndex].text);
        setProgress(steps[stepIndex].progress);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 480);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full opacity-20"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: `hsl(${240 + p.id * 10}, 80%, 70%)`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Animated background ring */}
        <motion.div
          className="absolute rounded-full border border-purple-500/20"
          style={{ width: 300, height: 300 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full border border-indigo-500/10"
          style={{ width: 420, height: 420 }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo */}
        <motion.div
          className="relative flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo icon */}
          <motion.div
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 50%, #06b6d4 100%)',
                boxShadow: '0 0 60px rgba(108,99,255,0.5)',
              }}
            >
              <img
                src="/logo.png"
                alt="Nexus Cloud"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span style="font-size:2.5rem">⚡</span>';
                  }
                }}
              />
            </div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
                opacity: 0.3,
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* App name */}
          <div className="text-center">
            <motion.h1
              className="text-4xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #6c63ff, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Nexus Cloud
            </motion.h1>
            <p className="text-gray-400 text-sm mt-1 font-medium tracking-widest uppercase">
              Panel Store
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-64 mt-2">
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #6c63ff, #3b82f6, #06b6d4)',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <motion.p
                key={statusText}
                className="text-xs text-gray-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {statusText}
              </motion.p>
              <p className="text-xs text-purple-400 font-mono">{progress}%</p>
            </div>
          </div>

          {/* Shimmer dots */}
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Version badge */}
        <motion.div
          className="absolute bottom-8 text-gray-600 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          v1.0.0 • Powered by Nexus Cloud
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
