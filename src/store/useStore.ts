import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  joinedAt: string;
  totalSpent: number;
  totalOrders: number;
  status: 'active' | 'vip' | 'new';
}

export interface Product {
  id: string;
  name: string;
  ram: number;
  cpu: number;
  disk: number;
  price: number;
  description: string;
  isBestSeller?: boolean;
  isPopular?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'pending' | 'success' | 'expired' | 'cancelled';
  paymentMethod: string;
  orderId: string;
  qrString?: string;
  expiredAt?: string;
  createdAt: string;
  completedAt?: string;
  panelCredentials?: {
    username: string;
    password: string;
    panelUrl: string;
    serverId: string;
  };
}

interface AppState {
  user: User | null;
  orders: Order[];
  currentPage: 'loading' | 'home' | 'products' | 'payment' | 'history' | 'profile' | 'success';
  currentOrder: Order | null;
  setUser: (user: User) => void;
  setCurrentPage: (page: AppState['currentPage']) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  setCurrentOrder: (order: Order | null) => void;
  cancelOrder: (orderId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      orders: [],
      currentPage: 'loading',
      currentOrder: null,
      setUser: (user) => set({ user }),
      setCurrentPage: (page) => set({ currentPage: page }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, ...updates } : o
          ),
          currentOrder:
            state.currentOrder?.orderId === orderId
              ? { ...state.currentOrder, ...updates }
              : state.currentOrder,
        })),
      setCurrentOrder: (order) => set({ currentOrder: order }),
      cancelOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status: 'cancelled' } : o
          ),
        })),
    }),
    {
      name: 'nexus-cloud-storage',
    }
  )
);

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '5GB RAM',
    ram: 5,
    cpu: 100,
    disk: 20,
    price: 7000,
    description: 'Cocok untuk server kecil & testing',
  },
  {
    id: 'p2',
    name: '6GB RAM',
    ram: 6,
    cpu: 150,
    disk: 25,
    price: 8000,
    description: 'Performa stabil untuk proyek ringan',
    isPopular: true,
  },
  {
    id: 'p3',
    name: '7GB RAM',
    ram: 7,
    cpu: 200,
    disk: 30,
    price: 9000,
    description: 'Ideal untuk game server kecil',
    isBestSeller: true,
  },
  {
    id: 'p4',
    name: '8GB RAM',
    ram: 8,
    cpu: 250,
    disk: 40,
    price: 10000,
    description: 'Kuat untuk multi-plugin server',
  },
  {
    id: 'p5',
    name: '9GB RAM',
    ram: 9,
    cpu: 300,
    disk: 50,
    price: 11000,
    description: 'Power ekstra untuk server aktif',
  },
  {
    id: 'p6',
    name: '10GB RAM',
    ram: 10,
    cpu: 350,
    disk: 60,
    price: 12000,
    description: 'High-performance dedicated resources',
  },
  {
    id: 'p7',
    name: 'Unlimited',
    ram: 0,
    cpu: 0,
    disk: 0,
    price: 20000,
    description: 'Tidak ada batasan resource sama sekali',
    isPopular: true,
  },
];
