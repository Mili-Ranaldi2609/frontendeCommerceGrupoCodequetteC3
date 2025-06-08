import { create } from 'zustand';

// --- Type Definitions (Centralized and More Detailed) ---
// It's highly recommended to define these in a separate file (e.g., `src/types/cart.ts`)
// and import them to ensure consistency across your application.

export interface CartItem {
  id: number; // Product ID
  name: string; // Product Name/Description
  price: number; // Price per unit
  quantity: number; // Quantity of this specific item
  color: string;
  talle: string;
  imageUrl?: string; // Optional: Image URL for display in cart/modal
}

interface CartState {
  items: CartItem[];
  total: number; // Calculated total price of all items
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void; // Allow adding with optional quantity
  removeFromCart: (id: number, color: string, talle: string) => void; // Identify item by ID, color, talle
  increaseQuantity: (id: number, color: string, talle: string) => void; // Identify by ID, color, talle
  decreaseQuantity: (id: number, color: string, talle: string) => void; // Identify by ID, color, talle
  doesItemExist: (id: number, color: string, talle: string) => boolean;
  
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0, // Initial total

  // --- Add to Cart Logic ---
  addToCart: (newItemPartial) => {
    const { id, color, talle, quantity = 1, ...rest } = newItemPartial; // Default quantity to 1

    // Find if an item with the exact same ID, color, and talle already exists
    const existingItemIndex = get().items.findIndex(
      (item) => item.id === id && item.color === color && item.talle === talle
    );

    let updatedItems: CartItem[];

    if (existingItemIndex > -1) {
      // If item exists, increase its quantity
      updatedItems = get().items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // If item does not exist, add it as a new entry
      updatedItems = [...get().items, { id, color, talle, quantity, ...rest }];
    }

    // Recalculate total
    const newTotal = updatedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    set({ items: updatedItems, total: newTotal });
  },

  // --- Remove From Cart Logic ---
  removeFromCart: (id, color, talle) => {
    const updatedItems = get().items.filter(
      (item) => !(item.id === id && item.color === color && item.talle === talle)
    );

    const newTotal = updatedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    set({ items: updatedItems, total: newTotal });
  },

  // --- Increase Quantity Logic ---
  increaseQuantity: (id, color, talle) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id && item.color === color && item.talle === talle
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      const newTotal = updatedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      return { items: updatedItems, total: newTotal };
    }),

    doesItemExist: (id, color, talle) => {
    return get().items.some(
      (item) => item.id === id && item.color === color && item.talle === talle
    );
  },
  // --- Decrease Quantity Logic ---
  decreaseQuantity: (id, color, talle) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id && item.color === color && item.talle === talle && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0); // Optional: remove item if quantity drops to 0

      const newTotal = updatedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      return { items: updatedItems, total: newTotal };
    }),

  // --- Clear Cart Logic ---
  clearCart: () => set({ items: [], total: 0 }),
}));