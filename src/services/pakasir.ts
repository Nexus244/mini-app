// Pakasir Payment Gateway Service
// Docs: https://pakasir.com/p/docs

const PAKASIR_API_BASE = 'https://app.pakasir.com/api';

// Config — in production, load from .env via Vite import.meta.env
const CONFIG = {
  PROJECT_SLUG: import.meta.env.VITE_PAKASIR_PROJECT_ID || 'nexuscloud',
  API_KEY: import.meta.env.VITE_PAKASIR_API_KEY || 'demo_api_key',
  PTERODACTYL_DOMAIN: import.meta.env.VITE_PTERODACTYL_DOMAIN || 'https://panel.nexuscloud.id',
  PTERODACTYL_API_KEY: import.meta.env.VITE_PTERODACTYL_API_KEY || 'demo_ptero_key',
};

export interface PakasirPaymentResponse {
  payment: {
    project: string;
    order_id: string;
    amount: number;
    fee: number;
    total_payment: number;
    payment_method: string;
    payment_number: string; // QR string
    expired_at: string;
  };
}

export interface PakasirTransactionDetail {
  transaction: {
    amount: number;
    order_id: string;
    project: string;
    status: 'pending' | 'completed' | 'expired' | 'cancelled';
    payment_method: string;
    completed_at?: string;
  };
}

// Generate unique order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NXS-${timestamp}-${random}`;
}

// Create QRIS Payment via Pakasir API
export async function createQrisPayment(
  orderId: string,
  amount: number
): Promise<PakasirPaymentResponse> {
  // DEMO mode: simulate API response when no real API key
  if (CONFIG.API_KEY === 'demo_api_key' || CONFIG.PROJECT_SLUG === 'nexuscloud') {
    return simulateCreatePayment(orderId, amount);
  }

  const response = await fetch(`${PAKASIR_API_BASE}/transactioncreate/qris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: CONFIG.PROJECT_SLUG,
      order_id: orderId,
      amount: amount,
      api_key: CONFIG.API_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Pakasir API error: ${response.status}`);
  }

  return response.json();
}

// Check transaction status
export async function checkTransactionStatus(
  orderId: string,
  amount: number
): Promise<PakasirTransactionDetail> {
  if (CONFIG.API_KEY === 'demo_api_key' || CONFIG.PROJECT_SLUG === 'nexuscloud') {
    return simulateCheckStatus(orderId);
  }

  const url = new URL(`${PAKASIR_API_BASE}/transactiondetail`);
  url.searchParams.set('project', CONFIG.PROJECT_SLUG);
  url.searchParams.set('order_id', orderId);
  url.searchParams.set('amount', amount.toString());
  url.searchParams.set('api_key', CONFIG.API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Check status error: ${response.status}`);
  }
  return response.json();
}

// Cancel transaction
export async function cancelTransaction(
  orderId: string,
  amount: number
): Promise<void> {
  if (CONFIG.API_KEY === 'demo_api_key') return;

  await fetch(`${PAKASIR_API_BASE}/transactioncancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: CONFIG.PROJECT_SLUG,
      order_id: orderId,
      amount: amount,
      api_key: CONFIG.API_KEY,
    }),
  });
}

// Get Pakasir payment page URL (alternative to API)
export function getPaymentUrl(orderId: string, amount: number): string {
  return `https://app.pakasir.com/pay/${CONFIG.PROJECT_SLUG}/${amount}?order_id=${orderId}&qris_only=1`;
}

// ========== DEMO/SIMULATION FUNCTIONS ==========
// These simulate real API calls for demo purposes

const demoPaymentStatuses: Record<string, { status: string; createdAt: number }> = {};

function simulateCreatePayment(
  orderId: string,
  amount: number
): PakasirPaymentResponse {
  // Store with timestamp for expiry simulation
  demoPaymentStatuses[orderId] = {
    status: 'pending',
    createdAt: Date.now(),
  };

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Realistic QRIS string (demo)
  const demoQrString =
    '00020101021226610016ID.CO.SHOPEE.WWW01189360091800216005230208216005230303UME51440014ID.CO.QRIS.WWW0215ID20243228429300303UME5204792953033605409' +
    amount.toString().padStart(10, '0') +
    '.005802ID5907Pakasir6012KAB. KEBUMEN61055439262230519NX' +
    orderId.replace(/-/g, '').substring(0, 8) +
    '63041A2F';

  return {
    payment: {
      project: 'nexuscloud',
      order_id: orderId,
      amount: amount,
      fee: Math.round(amount * 0.007),
      total_payment: Math.round(amount * 1.007),
      payment_method: 'qris',
      payment_number: demoQrString,
      expired_at: expiredAt,
    },
  };
}

function simulateCheckStatus(orderId: string): PakasirTransactionDetail {
  const record = demoPaymentStatuses[orderId];

  if (!record) {
    return {
      transaction: {
        amount: 0,
        order_id: orderId,
        project: 'nexuscloud',
        status: 'pending',
        payment_method: 'qris',
      },
    };
  }

  const elapsed = Date.now() - record.createdAt;

  // Auto-complete after 15 mins (expiry)
  if (elapsed > 15 * 60 * 1000) {
    record.status = 'expired';
  }

  return {
    transaction: {
      amount: 0,
      order_id: orderId,
      project: 'nexuscloud',
      status: record.status as 'pending' | 'completed' | 'expired' | 'cancelled',
      payment_method: 'qris',
      completed_at: record.status === 'completed' ? new Date().toISOString() : undefined,
    },
  };
}

// DEMO: Simulate payment success (for testing)
export function simulatePaymentSuccess(orderId: string): void {
  if (demoPaymentStatuses[orderId]) {
    demoPaymentStatuses[orderId].status = 'completed';
  }
}
