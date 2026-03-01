import type { ErrorStateProps } from "@/types/ui";

export default function ErrorState({ message, className = "text-red-600" }: ErrorStateProps) {
  return <p className={className}>{message}</p>;
}
