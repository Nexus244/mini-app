import { motion } from 'framer-motion';
import { useStore, PRODUCTS } from '../store/useStore';

const bgParticles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 5 + 4,
  delay: Math.random() * 3,
}));

const features = [
  { icon: '⚡', title: 'Instant Setup', desc: 'Panel aktif dalam detik' },
  { icon: '🔒', title: 'Private Server', desc: 'Enkripsi end-to-end' },
  { icon: '🌐', title: 'Uptime 99.9%', desc: 'Server selalu online' },
  { icon: '🖥️', title: 'Processor Intel Xeon', desc: 'Server stabil 99,9%' },
];

export default function HomePage() {
  const { user, setCurrentPage, orders } = useStore();

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const successOrders = orders.filter((o) => o.status === 'success');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen pb-28 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background particles */}
      {bgParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `hsl(${240 + p.id * 8}, 70%, 65%)`,
            opacity: 0.15,
          }}
          animate={{ y: [-15, 15, -15], x: [-8, 8, -8] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Hero Section */}
      <motion.div
        className="relative px-4 pt-12 pb-6"
        style={{
          background: 'linear-gradient(180deg, rgba(108,99,255,0.15) 0%, transparent 100%)',
        }}
        variants={itemVariants}
      >
        {/* Greeting */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">Selamat datang,</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">
              {user?.firstName || 'Pengguna'} 
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Server Online</span>
            </div>
          </div>
          <motion.button
            onClick={() => setCurrentPage('profile')}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(59,130,246,0.3))',
              border: '1px solid rgba(108,99,255,0.3)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            {user?.username?.[0]?.toUpperCase() || '👤'}
          </motion.button>
        </div>

        {/* Hero Banner */}
        <motion.div
          className="relative rounded-3xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 50%, #06b6d4 100%)',
            boxShadow: '0 20px 60px rgba(108,99,255,0.4)',
          }}
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          {/* Animated orb */}
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'white' }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-10"
            style={{ background: 'white' }}
            animate={{ scale: [1.3, 1, 1.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <div className="relative z-10">
            <p className="text-white/80 text-xs font-medium tracking-widest uppercase mb-2">
              🔥 Promo Aktif
            </p>
            <h2 className="text-white text-2xl font-black leading-tight mb-2">
              Panel Pterodactyl<br />Mulai Rp7.000/bulan
            </h2>
            <p className="text-white/80 text-sm mb-4">
              Setup instan, auto deploy, siap pakai!
            </p>
            <motion.button
              onClick={() => setCurrentPage('products')}
              className="bg-white text-purple-700 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              <span>Lihat Paket</span>
              <span>→</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      {user && (
        <motion.div className="px-4 mb-5" variants={itemVariants}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Order', value: user.totalOrders, icon: '📦', color: '#6c63ff' },
              { label: 'Aktif', value: successOrders.length, icon: '✅', color: '#10b981' },
              { label: 'Pending', value: pendingOrders.length, icon: '⏳', color: '#f59e0b' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Features Grid */}
      <motion.div className="px-4 mb-5" variants={itemVariants}>
        <h3 className="text-white font-bold text-base mb-3">Keunggulan Kami</h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{
                background: 'rgba(108,99,255,0.1)',
                borderColor: 'rgba(108,99,255,0.3)',
              }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-white font-semibold text-sm">{f.title}</div>
              <div className="text-gray-400 text-xs mt-0.5">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Products */}
      <motion.div className="px-4" variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-base">Paket Populer</h3>
          <button
            onClick={() => setCurrentPage('products')}
            className="text-purple-400 text-xs font-medium"
          >
            Lihat Semua →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {PRODUCTS.slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id}
              className="flex-shrink-0 rounded-2xl p-4 w-36"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              onClick={() => setCurrentPage('products')}
              whileTap={{ scale: 0.95 }}
            >
              {p.isBestSeller && (
                <div
                  className="text-xs font-bold mb-2 px-2 py-0.5 rounded-full inline-block"
                  style={{
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    color: 'white',
                  }}
                >
                  🔥 Best
                </div>
              )}
              <div className="text-white font-bold text-sm">{p.name}</div>
              <div className="text-purple-400 font-black text-base mt-1">
                Rp{p.price.toLocaleString('id-ID')}
              </div>
              <div className="text-gray-500 text-xs mt-1">/bulan</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
