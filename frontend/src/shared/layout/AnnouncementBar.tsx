const messages = [
  "Envíos a todo el país",
  "Piezas únicas hechas a mano",
  "Pagá seguro con Mercado Pago",
  "Encargá tu diseño personalizado",
  "Piedras naturales, resina y alambre",
];

export default function AnnouncementBar() {
  // Se duplica la lista para que la marquesina sea continua.
  const loop = [...messages, ...messages];

  return (
    <div className="app-marquee relative z-10 text-[11px] tracking-[0.18em] uppercase" role="region" aria-label="Novedades de la tienda">
      <p className="sr-only">{messages.join(". ")}</p>
      <div className="app-marquee-track py-2" aria-hidden="true">
        {loop.map((message, index) => (
          <span key={`${message}-${index}`} className="flex items-center gap-6 px-6">
            {message}
            <span className="text-mustard">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
