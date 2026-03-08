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
  quantity: number;
};

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};
