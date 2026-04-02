import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, PRODUCTS, type Product } from '../store/useStore';
import { generateOrderId, createQrisPayment } from '../services/pakasir';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { user, addOrder, setCurrentOrder, setCurrentPage } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async (product: Product) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const orderId = generateOrderId();
      const now = new Date().toISOString();
      const paymentRes = await createQrisPayment(orderId, product.price);
      const payment = paymentRes.payment;
      const newOrder = {
        id: Date.now().toString(),
        userId: user.id,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        status: 'pending' as const,
        paymentMethod: 'qris',
        orderId,
        qrString: payment.payment_number,
        expiredAt: payment.expired_at,
        createdAt: now,
      };
      addOrder(newOrder);
      setCurrentOrder(newOrder);
      setCurrentPage('payment');
    } catch {
      toast.error('Gagal membuat order. Coba lagi!');
    } finally {
      setIsLoading(false);
      setSelectedProduct(null);
    }
  };

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
        <h1 className="text-2xl font-black text-white">📦 Pilih Paket</h1>
        <p className="text-gray-400 text-sm mt-0.5">Panel Pterodactyl siap deploy otomatis</p>
      </div>

      <div className="px-4 pt-4">
        {PRODUCTS.map((product, idx) => (
          <motion.div
            key={product.id}
            className="relative mb-4 rounded-2xl overflow-hidden"
            style={{
              background: product.isBestSeller
                ? 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(59,130,246,0.15))'
                : 'rgba(255,255,255,0.04)',
              border: product.isBestSeller
                ? '1px solid rgba(108,99,255,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Badges */}
            {product.isBestSeller && (
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', color: 'white' }}
              >
                🔥 Best Seller
              </div>
            )}
            {product.isPopular && !product.isBestSeller && (
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(90deg, #6c63ff, #3b82f6)', color: 'white' }}
              >
                ⭐ Populer
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-xl">{product.name}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{product.description}</p>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-black"
                    style={{
                      background: 'linear-gradient(90deg, #6c63ff, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Rp{product.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-gray-500 text-xs">/bulan</div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'RAM', value: product.ram === 0 ? '∞' : `${product.ram}GB`, icon: '💾' },
                  { label: 'CPU', value: product.cpu === 0 ? '∞' : `${product.cpu}%`, icon: '⚙️' },
                  { label: 'Disk', value: product.disk === 0 ? '∞' : `${product.disk}GB`, icon: '💿' },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl p-2.5 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="text-sm mb-0.5">{spec.icon}</div>
                    <div className="text-white font-bold text-sm">{spec.value}</div>
                    <div className="text-gray-500 text-xs">{spec.label}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['Auto Deploy', 'Panel Login', 'Support 24/7', 'Backup 1x'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-lg text-purple-300"
                    style={{ background: 'rgba(108,99,255,0.15)' }}
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>

              {/* Buy button */}
              <motion.button
                onClick={() => setSelectedProduct(product)}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: product.isBestSeller
                    ? 'linear-gradient(135deg, #6c63ff, #3b82f6)'
                    : 'linear-gradient(135deg, rgba(108,99,255,0.6), rgba(59,130,246,0.6))',
                  boxShadow: product.isBestSeller ? '0 4px 20px rgba(108,99,255,0.4)' : 'none',
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
              >
                <span>🛒</span>
                <span>Beli Sekarang</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              className="relative w-full rounded-t-3xl p-6"
              style={{
                background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderBottom: 'none',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-5" />
              <h3 className="text-white font-black text-xl mb-1">Konfirmasi Order</h3>
              <p className="text-gray-400 text-sm mb-5">Pastikan detail order benar</p>

              <div
                className="rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}
              >
                {[
                  { label: 'Paket', value: selectedProduct.name },
                  { label: 'RAM', value: selectedProduct.ram === 0 ? 'Unlimited' : `${selectedProduct.ram}GB` },
                  { label: 'CPU', value: selectedProduct.cpu === 0 ? 'Unlimited' : `${selectedProduct.cpu}%` },
                  { label: 'Disk', value: selectedProduct.disk === 0 ? 'Unlimited' : `${selectedProduct.disk}GB` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between mb-3">
                    <span className="text-gray-400 text-sm">{row.label}</span>
                    <span className="text-white font-semibold">{row.value}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-gray-300 font-semibold">Total</span>
                  <span
                    className="font-black text-lg"
                    style={{
                      background: 'linear-gradient(90deg, #6c63ff, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Rp{selectedProduct.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-xs text-center mb-4">
                💳 Pembayaran via QRIS — Expire dalam 15 menit
              </p>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-gray-400 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={() => handleBuy(selectedProduct)}
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6c63ff, #3b82f6)',
                    boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Bayar QRIS</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
