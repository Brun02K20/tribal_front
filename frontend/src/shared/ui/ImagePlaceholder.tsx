import type { ImagePlaceholderProps } from "@/types/ui";

export default function ImagePlaceholder({
  className = "flex h-44 w-full items-center justify-center rounded-md bg-zinc-100",
  textClassName = "text-sm text-zinc-500",
  text = "Sin imagen",
}: ImagePlaceholderProps) {
  return (
    <div className={className}>
      <span className={textClassName}>{text}</span>
    </div>
  );
}
