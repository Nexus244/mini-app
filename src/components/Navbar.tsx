import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

type Page = 'home' | 'products' | 'history' | 'profile';

const navItems: { id: Page; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'products', icon: '📦', label: 'Produk' },
  { id: 'history', icon: '📋', label: 'Riwayat' },
  { id: 'profile', icon: '👤', label: 'Profil' },
];

export default function Navbar() {
  const { currentPage, setCurrentPage } = useStore();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div
        className="flex items-center justify-around py-3 px-2 rounded-2xl"
        style={{
          background: 'rgba(15,15,26,0.95)',
          border: '1px solid rgba(108,99,255,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
        }}
      >
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-1"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(59,130,246,0.2))',
                  }}
                  layoutId="navActive"
                  transition={{ type: 'spring', bounce: 0.3 }}
                />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span
                className="text-xs font-medium relative z-10 transition-colors"
                style={{ color: isActive ? '#6c63ff' : '#6b7280' }}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"
                  layoutId="navDot"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
