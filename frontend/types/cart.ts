export type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  precio_original?: number;
  id_descuento?: number | null;
  porcentaje_descuento?: number;
  stock: number;
  ancho?: number;
  alto?: number;
  profundo?: number;
  fotoUrl?: string;
  es_unico: boolean;
  disenos_urls: string[] | null;
  quantity: number;
};

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  /** Devuelve cuántas unidades se sumaron realmente (0 si ya estaba al tope de stock). */
  addItem: (item: AddCartItemInput) => number;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};
