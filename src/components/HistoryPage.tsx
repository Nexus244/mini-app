import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Order } from '../store/useStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';

type FilterStatus = 'all' | 'success' | 'pending' | 'expired' | 'cancelled';

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
  success: { label: 'Sukses', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '⌛' },
  cancelled: { label: 'Dibatalkan', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '🚫' },
};



function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const cfg = statusConfig[order.status];
  const creds = order.panelCredentials;

  const copyAll = () => {
    if (!creds) return;
    const text = `🔗 Panel: ${creds.panelUrl}\n👤 Username: ${creds.username}\n🔑 Password: ${creds.password}\n🆔 Server: ${creds.serverId}`;
    navigator.clipboard.writeText(text).then(() => toast.success('Disalin!'));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
      >
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Status header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-black text-lg">{order.productName}</h3>
            <p className="text-gray-400 text-xs font-mono mt-0.5">#{order.orderId}</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </div>
        </div>

        {/* Details */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { label: 'Tanggal Order', value: format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: id }) },
            { label: 'Metode Bayar', value: 'QRIS' },
            { label: 'Total Bayar', value: `Rp${order.amount.toLocaleString('id-ID')}` },
            { label: 'Status', value: cfg.label },
            ...(order.completedAt ? [{ label: 'Selesai', value: format(new Date(order.completedAt), 'dd MMM yyyy, HH:mm', { locale: id }) }] : []),
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-gray-400 text-sm">{row.label}</span>
              <span className="text-white text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Credentials */}
        {creds && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <p className="text-green-400 font-semibold text-sm mb-3">🔐 Data Login Panel</p>
            {[
              { label: 'Panel URL', value: creds.panelUrl, icon: '🌐' },
              { label: 'Username', value: creds.username, icon: '👤' },
              { label: 'Password', value: creds.password, icon: '🔑' },
              { label: 'Server ID', value: creds.serverId, icon: '🆔' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-sm">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs">{item.label}</p>
                  <p className="text-white text-xs font-mono truncate">{item.value}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(item.value); toast.success('Disalin!'); }}
                  className="text-purple-400 text-xs px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(108,99,255,0.15)' }}
                >
                  📋
                </button>
              </div>
            ))}
            <button
              onClick={copyAll}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
            >
              📋 Salin Semua
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-semibold text-gray-400 text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Tutup
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { orders } = useStore();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const filters: { id: FilterStatus; label: string; icon: string }[] = [
    { id: 'all', label: 'Semua', icon: '📋' },
    { id: 'success', label: 'Sukses', icon: '✅' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'expired', label: 'Expired', icon: '⌛' },
    { id: 'cancelled', label: 'Batal', icon: '🚫' },
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
        <h1 className="text-2xl font-black text-white">📋 Riwayat</h1>
        <p className="text-gray-400 text-sm mt-0.5">{orders.length} total transaksi</p>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {filters.map((f) => (
            <motion.button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={{
                background: filter === f.id ? 'linear-gradient(135deg, #6c63ff, #3b82f6)' : 'rgba(255,255,255,0.08)',
                color: filter === f.id ? 'white' : '#9ca3af',
                border: filter === f.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span className="text-xs opacity-70">
                ({f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length})
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-white font-bold text-lg mb-1">Belum Ada Transaksi</h3>
              <p className="text-gray-400 text-sm">Mulai beli paket untuk melihat riwayat</p>
            </motion.div>
          ) : (
            filtered.map((order, i) => {
              const cfg = statusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedOrder(order)}
                  className="mb-3 rounded-2xl p-4 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(108,99,255,0.2)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm">{order.productName}</span>
                      </div>
                      <p className="text-gray-500 text-xs font-mono mb-1">#{order.orderId}</p>
                      <p className="text-gray-400 text-xs">
                        {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div
                        className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </div>
                      <span
                        className="font-bold text-sm"
                        style={{
                          background: 'linear-gradient(90deg, #6c63ff, #3b82f6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Rp{order.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {order.panelCredentials && (
                    <div
                      className="mt-3 p-2 rounded-xl flex items-center gap-2"
                      style={{ background: 'rgba(16,185,129,0.08)' }}
                    >
                      <span className="text-green-400 text-xs">🔐 Panel aktif</span>
                      <span className="text-gray-500 text-xs font-mono truncate flex-1">
                        {order.panelCredentials.username}
                      </span>
                      <span className="text-gray-500 text-xs">Tap detail →</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
