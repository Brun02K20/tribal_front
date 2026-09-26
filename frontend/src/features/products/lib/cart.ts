import type { AddCartItemInput } from "@/types/cart";
import type { Product } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";

// Ítem de carrito para un producto que se compra sin elegir diseños.
export const toSimpleCartItem = (product: Product, quantity = 1): AddCartItemInput => {
  const precioOriginal = toNumber(product.precio);

  return {
    id: product.id,
    nombre: product.nombre,
    precio: toNumber(product.precio_final ?? precioOriginal),
    precio_original: precioOriginal,
    id_descuento: product.descuento_aplicado?.id_descuento ?? null,
    porcentaje_descuento: product.descuento_aplicado?.porcentaje,
    stock: toNumber(product.stock),
    ancho: toNumber(product.ancho),
    alto: toNumber(product.alto),
    profundo: toNumber(product.profundo),
    fotoUrl: product.fotos?.[0]?.url,
    quantity,
    es_unico: product.es_unico,
    disenos_urls: null,
  };
};
