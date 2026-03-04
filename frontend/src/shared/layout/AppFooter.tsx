import Link from "next/link";

const footerPhrase = "La imaginación,la habilidad, la creacion. Arte que luce tanto o mas que el oro y la plata.Embellecete con una pieza de arte hecha a mano. Se diferente";

export default function AppFooter() {
  return (
    <footer className="border-t border-earth-brown bg-cream/95 px-4 py-6 text-center">
      <div className="mx-auto flex w-full max-w-360 flex-col items-center gap-4">
        <p className="app-title text-lg font-bold text-black md:text-xl">
          {footerPhrase}
        </p>

        <Link
          href="https://www.instagram.com/tribal_trend/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Tribal Trend"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-earth-brown text-earth-brown transition hover:bg-earth-brown hover:text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}