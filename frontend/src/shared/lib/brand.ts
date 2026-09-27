export const INSTAGRAM_URL = "https://www.instagram.com/tribal_trend/";
export const INSTAGRAM_HANDLE = "@tribal_trend";
export const LANDING_URL = "https://landing.tribaltrend.com.ar";

// Evento global para abrir el chat de soporte desde cualquier CTA.
export const OPEN_CHAT_EVENT = "tribal:open-chat";

// Los encargos requieren una cuenta de cliente: al visitante lo llevamos al login y lo devolvemos al formulario.
export const getEncargosHref = (isAuthenticated: boolean) =>
  isAuthenticated ? "/encargos" : "/login?redirect=/encargos";

export const TRUST_POINTS = [
  { key: "envios", title: "Envíos a todo el país", detail: "Con Correo Argentino, a domicilio o sucursal" },
  { key: "pago", title: "Pago 100% seguro", detail: "Pagás con Mercado Pago" },
  { key: "artesanal", title: "Hecho a mano", detail: "Piedras naturales, resina y alambre" },
  { key: "unico", title: "Piezas únicas", detail: "Diseños irrepetibles, de a una" },
] as const;
