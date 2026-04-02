import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, PRODUCTS } from '../store/useStore';
import { checkTransactionStatus, cancelTransaction, simulatePaymentSuccess } from '../services/pakasir';
import { createPanelUser } from '../services/pterodactyl';
import toast from 'react-hot-toast';

function CountdownTimer({ expiredAt }: { expiredAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [percent, setPercent] = useState(100);
  const TOTAL = 15 * 60;

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(expiredAt).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setTimeLeft(`${m}:${s}`);
      setPercent(Math.round((diff / TOTAL) * 100));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiredAt]);

  const color =
    percent > 50 ? '#10b981' : percent > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${percent * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
        }}
      >
        <div
          className="absolute w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: '#1a1a2e' }}
        >
          <span className="text-white font-mono font-bold text-sm">{timeLeft}</span>
        </div>
      </div>
      <span className="text-gray-400 text-xs">Waktu tersisa</span>
    </div>
  );
}

export default function PaymentPage() {
  const { currentOrder, updateOrder, setCurrentPage, user } = useStore();
  const [isChecking, setIsChecking] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [scanPulse, setScanPulse] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const order = currentOrder;
  const product = order ? PRODUCTS.find((p) => p.id === order.productId) : null;

  const handleSuccess = useCallback(async () => {
    if (!order || !user || !product) return;
    if (pollRef.current) clearInterval(pollRef.current);
    setScanPulse(false);

    updateOrder(order.orderId, { status: 'success', completedAt: new Date().toISOString() });
    setIsProvisioning(true);
    toast.loading('🚀 Membuat panel Anda...', { id: 'provisioning' });

    try {
      const creds = await createPanelUser(user.id, user.username, product);
      updateOrder(order.orderId, { panelCredentials: creds });

      // Update user stats
      toast.success('✅ Panel berhasil dibuat!', { id: 'provisioning' });
      setCurrentPage('success');
    } catch {
      toast.error('Gagal membuat panel. Hubungi support.', { id: 'provisioning' });
    } finally {
      setIsProvisioning(false);
    }
  }, [order, user, product]);

  const checkStatus = useCallback(async () => {
    if (!order || order.status !== 'pending') return;
    setIsChecking(true);
    try {
      const res = await checkTransactionStatus(order.orderId, order.amount);
      const status = res.transaction.status;
      if (status === 'completed') {
        await handleSuccess();
      } else if (status === 'expired') {
        updateOrder(order.orderId, { status: 'expired' });
        if (pollRef.current) clearInterval(pollRef.current);
        toast.error('⌛ Pembayaran kadaluarsa');
      }
    } catch {
      toast.error('Gagal cek status');
    } finally {
      setIsChecking(false);
    }
  }, [order, handleSuccess]);

  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    pollRef.current = setInterval(checkStatus, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [order?.orderId, order?.status]);

  const handleCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await cancelTransaction(order.orderId, order.amount);
      updateOrder(order.orderId, { status: 'cancelled' });
      if (pollRef.current) clearInterval(pollRef.current);
      toast.success('Order dibatalkan');
      setCurrentPage('products');
    } catch {
      toast.error('Gagal batalkan order');
    } finally {
      setIsCancelling(false);
    }
  };

  // DEMO: Simulate payment
  const handleDemoSuccess = async () => {
    if (!order) return;
    simulatePaymentSuccess(order.orderId);
    await checkStatus();
  };

  if (!order) return null;

  return (
    <div className="min-h-screen pb-28 flex flex-col">
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-12 pb-4 flex items-center gap-3"
        style={{
          background: 'rgba(15,15,26,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button
          onClick={() => setCurrentPage('products')}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-white font-black text-lg">💳 Pembayaran QRIS</h1>
          <p className="text-gray-400 text-xs">Order #{order.orderId}</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex-1">
        {/* Status indicator */}
        <AnimatePresence mode="wait">
          {order.status === 'pending' && (
            <motion.div
              key="pending"
              className="mb-4 rounded-2xl p-3 flex items-center gap-3"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="flex-1">
                <p className="text-amber-400 font-semibold text-sm">Menunggu Pembayaran</p>
                <p className="text-amber-300/60 text-xs">Auto-refresh setiap 5 detik</p>
              </div>
              {isChecking && (
                <motion.div
                  className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          )}
          {order.status === 'expired' && (
            <motion.div
              key="expired"
              className="mb-4 rounded-2xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-2xl">⌛</span>
              <div>
                <p className="text-red-400 font-semibold text-sm">Pembayaran Kadaluarsa</p>
                <p className="text-red-300/60 text-xs">Buat order baru untuk melanjutkan</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Card */}
        <motion.div
          className="rounded-3xl p-5 mb-4 flex flex-col items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Product summary */}
          <div className="w-full mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs">Paket</p>
                <p className="text-white font-bold">{order.productName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Total</p>
                <p
                  className="font-black text-xl"
                  style={{
                    background: 'linear-gradient(90deg, #6c63ff, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Rp{order.amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {order.qrString && order.status === 'pending' ? (
            <div className="relative mb-4">
              {/* Scan animation */}
              <div
                className="relative rounded-2xl overflow-hidden p-3"
                style={{ background: 'white' }}
              >
                <QRCodeSVG
                  value={order.qrString}
                  size={220}
                  level="M"
                  includeMargin={false}
                />
                {/* Scan line */}
                {scanPulse && (
                  <motion.div
                    className="absolute left-3 right-3 h-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #6c63ff, transparent)',
                      opacity: 0.8,
                    }}
                    animate={{ top: ['12px', 'calc(100% - 12px)', '12px'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>
              {/* QRIS badge */}
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(90deg, #6c63ff, #3b82f6)' }}
              >
                QRIS
              </div>
            </div>
          ) : order.status === 'expired' ? (
            <div className="py-8 text-center">
              <div className="text-5xl mb-3">⌛</div>
              <p className="text-red-400 font-semibold">QR Kadaluarsa</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <motion.div
                className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-gray-400 text-sm">Memproses...</p>
            </div>
          )}

          {/* Timer */}
          {order.expiredAt && order.status === 'pending' && (
            <div className="mt-6">
              <CountdownTimer expiredAt={order.expiredAt} />
            </div>
          )}

          {/* Instructions */}
          {order.status === 'pending' && (
            <div
              className="mt-4 w-full rounded-xl p-3 text-center"
              style={{ background: 'rgba(108,99,255,0.1)' }}
            >
              <p className="text-purple-300 text-xs font-medium">
                📱 Buka aplikasi m-banking / e-wallet → Scan QR di atas
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <motion.button
            onClick={checkStatus}
            disabled={isChecking || order.status !== 'pending'}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              opacity: order.status !== 'pending' ? 0.5 : 1,
            }}
            whileTap={{ scale: 0.97 }}
          >
            {isChecking ? (
              <motion.div
                className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <span>🔄</span>
            )}
            <span className="text-gray-300">Cek Status</span>
          </motion.button>

          {order.status === 'pending' ? (
            <motion.button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span>🚫</span>
              <span className="text-red-400">Batalkan</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setCurrentPage('products')}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span>🔁</span>
              <span className="text-white">Order Baru</span>
            </motion.button>
          )}
        </div>

        {/* DEMO Button */}
        {order.status === 'pending' && (
          <motion.button
            onClick={handleDemoSuccess}
            disabled={isProvisioning}
            className="w-full py-3 rounded-xl text-xs font-medium"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px dashed rgba(16,185,129,0.4)',
              color: '#10b981',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {isProvisioning ? '⏳ Memproses...' : '✨ [DEMO] Simulasi Bayar Sukses'}
          </motion.button>
        )}

        {/* Provisioning overlay */}
        <AnimatePresence>
          {isProvisioning && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: '0 0 40px rgba(16,185,129,0.5)',
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-3xl">🚀</span>
              </motion.div>
              <div className="text-center">
                <h3 className="text-white font-bold text-xl mb-1">Membuat Panel...</h3>
                <p className="text-gray-400 text-sm">Mohon tunggu sebentar</p>
              </div>
              {['Verifikasi pembayaran...', 'Membuat akun user...', 'Deploy server...', 'Konfigurasi resource...'].map(
                (step, i) => (
                  <motion.div
                    key={step}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1, delay: i * 0.5, repeat: Infinity }}
                    />
                    <span className="text-gray-300 text-sm">{step}</span>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
