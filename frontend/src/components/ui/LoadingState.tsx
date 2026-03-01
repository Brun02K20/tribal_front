import type { LoadingStateProps } from "@/types/ui";

export default function LoadingState({ message = "Cargando...", className }: LoadingStateProps) {
  return <p className={className}>{message}</p>;
}
