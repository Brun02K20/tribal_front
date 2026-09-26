import { IconGem, IconHand, IconLock, IconTruck } from "@/shared/ui/Icons";
import type { TRUST_POINTS } from "@/shared/lib/brand";

type TrustKey = (typeof TRUST_POINTS)[number]["key"];

export default function TrustIcon({ name, className = "h-5 w-5" }: { name: TrustKey; className?: string }) {
  switch (name) {
    case "envios":
      return <IconTruck className={className} />;
    case "pago":
      return <IconLock className={className} />;
    case "artesanal":
      return <IconHand className={className} />;
    case "unico":
      return <IconGem className={className} />;
  }
}
