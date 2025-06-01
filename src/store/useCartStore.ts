import { create } from 'zustand';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  total: number;
  clearCart: () => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
}
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  addToCart: (newItem) => {
    const existing = get().items.find((item) => item.id === newItem.id);
    
    let updatedItems;
    if (existing) {
      updatedItems = get().items.map((item) =>
        item.id === newItem.id
      ? { ...item, quantity: item.quantity + newItem.quantity }
      : item
    );
  } else {
    updatedItems = [...get().items, newItem];
    }
    
    const newTotal = updatedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    
    set({ items: updatedItems, total: newTotal });
  },
  clearCart: () => set({ items: [], total: 0 }),
  increaseQuantity: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    })),
  decreaseQuantity: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    })),
}));
