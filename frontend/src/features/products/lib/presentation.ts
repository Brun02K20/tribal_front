import type { Product, ProductDiseno } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";

export type ProductDisenoWithPhoto = ProductDiseno & { url_foto: string };

export const hasDesignPhoto = (diseno: ProductDiseno): diseno is ProductDisenoWithPhoto => Boolean(diseno.url_foto);

export const getDesignsWithPhoto = (product: Product) => (product.disenos ?? []).filter(hasDesignPhoto);

// Un producto "multi diseño" se compra eligiendo diseños; su precio sale de cada diseño y no lleva descuento.
export const isMultiDesign = (product: Product) => !product.es_unico && getDesignsWithPhoto(product).length > 0;

export const getProductImages = (product: Product): string[] => {
  const designImages = isMultiDesign(product) ? getDesignsWithPhoto(product).map((diseno) => diseno.url_foto) : [];
  const photos = (product.fotos ?? []).map((foto) => foto.url).filter(Boolean);
  return Array.from(new Set([...designImages, ...photos]));
};

export type ProductPricing = {
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  isFromPrice: boolean;
};

export const getProductPricing = (product: Product): ProductPricing => {
  if (isMultiDesign(product)) {
    const prices = getDesignsWithPhoto(product)
      .map((diseno) => toNumber(diseno.precio))
      .filter((price) => Number.isFinite(price) && price > 0);
    if (prices.length) {
      return {
        price: Math.min(...prices),
        originalPrice: null,
        discountPercentage: 0,
        isFromPrice: new Set(prices).size > 1,
      };
    }
  }

  const basePrice = toNumber(product.precio);
  const discountPercentage = Number(product.descuento_aplicado?.porcentaje ?? 0);
  const hasDiscount = discountPercentage > 0;

  return {
    price: hasDiscount ? toNumber(product.precio_final ?? basePrice) : basePrice,
    originalPrice: hasDiscount ? basePrice : null,
    discountPercentage: hasDiscount ? discountPercentage : 0,
    isFromPrice: false,
  };
};

export const LOW_STOCK_THRESHOLD = 3;

export const getStockInfo = (product: Product) => {
  const stock = toNumber(product.stock);
  return {
    stock,
    isSoldOut: stock <= 0,
    isLowStock: stock > 0 && stock <= LOW_STOCK_THRESHOLD,
  };
};
