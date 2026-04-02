import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const confettiItems = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: ['#6c63ff', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 5],
  size: Math.random() * 8 + 4,
  delay: Math.random() * 0.5,
}));

export default function SuccessPage() {
  const { currentOrder, setCurrentPage } = useStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const creds = currentOrder?.panelCredentials;

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      toast.success(`${field} disalin!`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const copyAll = () => {
    if (!creds) return;
    const text = `🎉 Nexus Cloud — Panel Anda Siap!\n\n🔗 Panel URL: ${creds.panelUrl}\n👤 Username: ${creds.username}\n🔑 Password: ${creds.password}\n🆔 Server ID: ${creds.serverId}\n\n⚡ Powered by Nexus Cloud`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Semua info berhasil disalin!');
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 px-4 pb-28 overflow-hidden">
      {/* Confetti */}
      {confettiItems.map((c) => (
        <motion.div
          key={c.id}
          className="fixed rounded-sm pointer-events-none"
          style={{
            width: c.size,
            height: c.size,
            left: `${c.x}%`,
            top: -20,
            background: c.color,
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Success badge */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            boxShadow: '0 0 60px rgba(16,185,129,0.5)',
          }}
        >
          <motion.span
            className="text-5xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          >
            ✅
          </motion.span>
        </div>
        {/* Pulse rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-green-400"
            animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-black text-white mb-2">Panel Siap! 🎉</h1>
        <p className="text-gray-400 text-sm">
          Server Anda telah berhasil dibuat dan siap digunakan
        </p>
      </motion.div>

      {/* Credentials Card */}
      {creds && (
        <motion.div
          className="w-full rounded-3xl p-5 mb-4"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(16,185,129,0.3)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-400 font-bold text-sm">🔐 Data Login Panel</span>
          </div>

          {[
            { label: 'Panel URL', value: creds.panelUrl, icon: '🌐', field: 'Panel URL' },
            { label: 'Username', value: creds.username, icon: '👤', field: 'Username' },
            { label: 'Password', value: creds.password, icon: '🔑', field: 'Password' },
            { label: 'Server ID', value: creds.serverId, icon: '🆔', field: 'Server ID' },
          ].map((item) => (
            <div
              key={item.field}
              className="flex items-center justify-between py-3 px-3 rounded-xl mb-2"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs">{item.label}</p>
                  <p className="text-white text-sm font-mono truncate">{item.value}</p>
                </div>
              </div>
              <motion.button
                onClick={() => copyToClipboard(item.value, item.field)}
                className="flex-shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background:
                    copiedField === item.field
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(108,99,255,0.2)',
                  color: copiedField === item.field ? '#10b981' : '#a78bfa',
                  border: `1px solid ${copiedField === item.field ? 'rgba(16,185,129,0.3)' : 'rgba(108,99,255,0.3)'}`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                {copiedField === item.field ? '✓' : '📋'}
              </motion.button>
            </div>
          ))}

          {/* Copy All */}
          <motion.button
            onClick={copyAll}
            className="w-full py-3 mt-2 rounded-xl font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981',
            }}
            whileTap={{ scale: 0.97 }}
          >
            📋 Salin Semua Info
          </motion.button>
        </motion.div>
      )}

      {/* Open Panel Button */}
      <motion.a
        href={creds?.panelUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-3 mb-3"
        style={{
          background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
          boxShadow: '0 8px 30px rgba(108,99,255,0.4)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
      >
        <span>🚀</span>
        <span>Buka Panel</span>
        <span>↗</span>
      </motion.a>

      <motion.button
        onClick={() => setCurrentPage('history')}
        className="w-full py-3.5 rounded-2xl font-semibold text-sm"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#9ca3af',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.97 }}
      >
        📋 Lihat Riwayat
      </motion.button>
    </div>
  );
}
