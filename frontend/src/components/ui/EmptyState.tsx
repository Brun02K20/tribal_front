import type { EmptyStateProps } from "@/types/ui";

export default function EmptyState({ message, className, action }: EmptyStateProps) {
  return (
    <div className={className}>
      <p>{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
