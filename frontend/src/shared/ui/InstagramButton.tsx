import Link from "next/link";

type InstagramButtonProps = {
  className?: string;
  onClick?: () => void;
};

const defaultClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-earth-brown text-earth-brown transition hover:bg-earth-brown hover:text-cream";

export default function InstagramButton({ className, onClick }: InstagramButtonProps) {
  return (
    <Link
      href="https://www.instagram.com/tribal_trend/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram de Tribal Trend"
      className={className ?? defaultClassName}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    </Link>
  );
}