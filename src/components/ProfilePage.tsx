import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const avatarColors = [
  'linear-gradient(135deg, #6c63ff, #3b82f6)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

export default function ProfilePage() {
  const { user, orders } = useStore();

  if (!user) return null;

  const successOrders = orders.filter((o) => o.status === 'success');
  const totalSpent = successOrders.reduce((a, o) => a + o.amount, 0);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const avatarGradient = avatarColors[parseInt(user.id || '0') % 4];

  const statusConfig = {
    new: { label: 'New User', color: '#6b7280', icon: '🆕' },
    active: { label: 'Active', color: '#10b981', icon: '✅' },
    vip: { label: 'VIP', color: '#f59e0b', icon: '⭐' },
  };
  const statusInfo = statusConfig[user.status] || statusConfig.new;

  const stats = [
    { label: 'Total Order', value: user.totalOrders || successOrders.length, icon: '📦', color: '#6c63ff' },
    { label: 'Total Belanja', value: `Rp${totalSpent.toLocaleString('id-ID')}`, icon: '💰', color: '#10b981' },
    { label: 'Pending', value: pending, icon: '⏳', color: '#f59e0b' },
    { label: 'Panel Aktif', value: successOrders.length, icon: '🚀', color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-12 pb-4"
        style={{
          background: 'rgba(15,15,26,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <h1 className="text-2xl font-black text-white">👤 Profil Saya</h1>
        <p className="text-gray-400 text-sm mt-0.5">Informasi akun Anda</p>
      </div>

      <div className="px-4 pt-6">
        {/* Profile Card */}
        <motion.div
          className="rounded-3xl p-6 mb-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(59,130,246,0.1))',
            border: '1px solid rgba(108,99,255,0.25)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Background decoration */}
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #3b82f6)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          <div className="flex items-center gap-4 relative z-10">
            {/* Avatar */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
                style={{ background: avatarGradient }}
              >
                {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
              </div>
              {/* Status indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs"
                style={{ background: statusInfo.color }}
              >
                {statusInfo.icon}
              </div>
            </motion.div>

            <div className="flex-1">
              <h2 className="text-white font-black text-xl">
                {user.firstName} {user.lastName}
              </h2>
              {user.username && (
                <p className="text-purple-400 text-sm font-medium">@{user.username}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                >
                  {statusInfo.icon} {statusInfo.label}
                </div>
              </div>
            </div>
          </div>

          {/* Join date */}
          <div className="mt-4 pt-4 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">📅 Bergabung</span>
              <span className="text-gray-300 text-xs font-medium">
                {user.joinedAt
                  ? format(new Date(user.joinedAt), 'dd MMMM yyyy', { locale: id })
                  : 'Hari ini'}
              </span>
            </div>
            {user.id && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400 text-xs">🆔 Telegram ID</span>
                <span className="text-gray-300 text-xs font-mono">{user.id}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div
                className="font-black text-lg"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Account Info */}
        <motion.div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <h3 className="text-white font-bold text-sm">ℹ️ Info Akun</h3>
          </div>
          {[
            { label: 'Platform', value: 'Telegram Web App', icon: '📱' },
            { label: 'Tipe Akun', value: 'Standard', icon: '👤' },
            { label: 'Support', value: 'Chat @nexuscloud_bot', icon: '💬' },
          ].map((item, i) => (
            <div
              key={item.label}
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-gray-400 text-sm">{item.label}</span>
              </div>
              <span className="text-white text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </motion.div>

        {/* App Info */}
        <motion.div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(108,99,255,0.05)',
            border: '1px solid rgba(108,99,255,0.15)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="text-2xl font-black mb-1"
            style={{
              background: 'linear-gradient(90deg, #6c63ff, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ⚡ Nexus Cloud
          </div>
          <p className="text-gray-500 text-xs">Panel Store v1.0.0</p>
          <p className="text-gray-600 text-xs mt-1">© 2025 Nexus Cloud. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}
