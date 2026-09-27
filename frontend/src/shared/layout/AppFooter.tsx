import Link from "next/link";
import InstagramButton from "@/shared/ui/InstagramButton";
import TrustIcon from "@/shared/ui/TrustIcon";
import { IconArrowRight } from "@/shared/ui/Icons";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, LANDING_URL, TRUST_POINTS } from "@/shared/lib/brand";

const footerPhrase = "La imaginación, la habilidad, la creación. Arte que luce tanto o más que el oro y la plata. Embellecete con una pieza de arte hecha a mano.";
const footerPunchline = "Sé diferente.";

const footerLinks = [
  { href: "/products", label: "Tienda" },
  { href: "/encargos", label: "Encargos personalizados" },
  { href: "/blog", label: "Blog" },
  { href: LANDING_URL, label: "Conocenos", external: true },
  { href: `${LANDING_URL}/preguntas-frecuentes`, label: "Preguntas frecuentes", external: true },
];

export default function AppFooter() {
  return (
    <footer className="app-footer-shared mt-12 border-t border-earth-brown/50 bg-transparent px-4">
      <div className="relative z-10 mx-auto w-full max-w-360 py-10 md:py-14">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <li key={point.key} className="flex flex-col items-center gap-2 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-earth-brown/40 bg-cream/80 text-earth-brown">
                <TrustIcon name={point.key} className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-black">{point.title}</p>
              <p className="text-xs text-dark-gray">{point.detail}</p>
            </li>
          ))}
        </ul>

        <div className="app-ornament my-10 text-mustard" aria-hidden="true">✦</div>

        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="app-display text-xl md:text-3xl">
            {footerPhrase} <span className="text-terracotta">{footerPunchline}</span>
          </p>
        </blockquote>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/products" className="app-btn-cta">
            Elegí tu pieza <IconArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-btn-outline"
          >
            Seguinos {INSTAGRAM_HANDLE}
          </a>
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" aria-label="Enlaces del pie de página">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="app-nav-link"
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-line pt-6 text-xs text-dark-gray md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Tribal Trend · Joyería artesanal hecha en Argentina</p>
          <InstagramButton />
        </div>
      </div>
    </footer>
  );
}
