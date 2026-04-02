import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import PaymentPage from './components/PaymentPage';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import SuccessPage from './components/SuccessPage';
import { useStore } from './store/useStore';
import type { User } from './store/useStore';

// Telegram WebApp type
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
          };
        };
        MainButton?: {
          show: () => void;
          hide: () => void;
        };
      };
    };
  }
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `hsl(${240 + p.id * 12}, 80%, 65%)`,
            opacity: 0.12,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-8, 8, -8],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Main gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
        }}
      />
      {/* Top accent */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ x: ['-50%', '-30%', '-50%'], y: ['-50%', '-40%', '-50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom accent */}
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          transform: 'translate(50%, 50%)',
        }}
        animate={{ x: ['50%', '30%', '50%'], y: ['50%', '40%', '50%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function App() {
  const { currentPage, setCurrentPage, user, setUser } = useStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Init Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Get Telegram user data
    const tgUser = tg?.initDataUnsafe?.user;

    if (!user) {
      // Create or restore user
      const newUser: User = {
        id: tgUser?.id?.toString() || `demo_${Date.now()}`,
        username: tgUser?.username || 'demo_user',
        firstName: tgUser?.first_name || 'Demo',
        lastName: tgUser?.last_name || 'User',
        joinedAt: new Date().toISOString(),
        totalSpent: 0,
        totalOrders: 0,
        status: 'new',
      };
      setUser(newUser);
    }
  }, []);

  const showNavbar = ['home', 'products', 'history', 'profile'].includes(currentPage);

  return (
    <div className="relative min-h-screen" style={{ background: '#0f0f1a' }}>
      <AnimatedBackground />
      <FloatingParticles />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(26,26,46,0.95)',
            color: '#ffffff',
            border: '1px solid rgba(108,99,255,0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
          loading: {
            iconTheme: { primary: '#6c63ff', secondary: '#fff' },
          },
        }}
      />

      {/* Loading screen */}
      <AnimatePresence>
        {currentPage === 'loading' && (
          <LoadingScreen onComplete={() => setCurrentPage('home')} />
        )}
      </AnimatePresence>

      {/* Main content */}
      {currentPage !== 'loading' && (
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <HomePage />
              </motion.div>
            )}
            {currentPage === 'products' && (
              <motion.div key="products" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <ProductsPage />
              </motion.div>
            )}
            {currentPage === 'payment' && (
              <motion.div key="payment" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <PaymentPage />
              </motion.div>
            )}
            {currentPage === 'history' && (
              <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <HistoryPage />
              </motion.div>
            )}
            {currentPage === 'profile' && (
              <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <ProfilePage />
              </motion.div>
            )}
            {currentPage === 'success' && (
              <motion.div key="success" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <SuccessPage />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom navigation */}
          <AnimatePresence>
            {showNavbar && <Navbar />}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
