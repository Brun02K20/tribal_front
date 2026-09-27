const trimSlash = (value: string) => value.replace(/\/+$/, '');

export const STORE_URL = trimSlash(import.meta.env.STORE_URL ?? 'https://tribaltrend.com.ar');
export const API_URL = trimSlash(import.meta.env.API_URL ?? 'https://api.tribaltrend.com.ar');
export const INSTAGRAM_URL = 'https://www.instagram.com/tribal_trend/';
export const INSTAGRAM_HANDLE = '@tribal_trend';

export const SHOP_URL = `${STORE_URL}/products`;
export const ENCARGOS_URL = `${STORE_URL}/login?redirect=/encargos`;

export type ShowcaseProduct = {
  id: number;
  nombre: string;
  image: string;
  price: number;
  isFromPrice: boolean;
  isUnique: boolean;
  href: string;
};

type ApiProduct = {
  id: number;
  nombre: string;
  precio: number | string;
  precio_final?: number;
  stock: number | string;
  es_activo?: boolean;
  es_unico: boolean;
  fotos?: { url: string }[];
  disenos?: { precio: number | string; url_foto: string | null }[];
};

const toShowcase = (product: ApiProduct): ShowcaseProduct | null => {
  const designs = (product.disenos ?? []).filter((diseno) => Boolean(diseno.url_foto));
  const isMultiDesign = !product.es_unico && designs.length > 0;
  const image = isMultiDesign ? designs[0].url_foto : product.fotos?.[0]?.url;
  if (!image || Number(product.stock) <= 0 || product.es_activo === false) {
    return null;
  }

  const designPrices = designs.map((diseno) => Number(diseno.precio)).filter((price) => price > 0);
  const price = isMultiDesign && designPrices.length
    ? Math.min(...designPrices)
    : Number(product.precio_final ?? product.precio);

  return {
    id: product.id,
    nombre: product.nombre,
    image,
    price,
    isFromPrice: isMultiDesign && new Set(designPrices).size > 1,
    isUnique: product.es_unico,
    href: `${STORE_URL}/products/${product.id}`,
  };
};

// Piezas más nuevas de la tienda. Si la API no responde a tiempo, la landing sigue funcionando sin fotos.
export async function getShowcaseProducts(limit = 8): Promise<ShowcaseProduct[]> {
  try {
    const response = await fetch(`${API_URL}/productos?page=1`, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) {
      return [];
    }
    const body = (await response.json()) as { data?: ApiProduct[] };
    return (body.data ?? [])
      .map(toShowcase)
      .filter((product): product is ShowcaseProduct => product !== null)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
