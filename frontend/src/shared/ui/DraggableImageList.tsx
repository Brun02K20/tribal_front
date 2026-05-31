"use client";

import { useRef, useState } from "react";

type Props = {
    files: File[];
    onChange: (reordered: File[]) => void;
};

export default function DraggableImageList({ files, onChange }: Props) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const previewUrls = useRef<Map<File, string>>(new Map());

    const getPreview = (file: File) => {
        if (!previewUrls.current.has(file)) {
            previewUrls.current.set(file, URL.createObjectURL(file));
        }
        return previewUrls.current.get(file)!;
    };

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setOverIndex(index);
    };

    const handleDrop = (dropIndex: number) => {
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null);
            setOverIndex(null);
            return;
        }

        const reordered = [...files];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        onChange(reordered);
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setOverIndex(null);
    };

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        onChange(updated);
    };

    if (files.length === 0) return null;

    return (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {files.map((file, i) => (
                <div
                    key={`${file.name}-${file.size}-${i}`}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={handleDragEnd}
                    className={`relative shrink-0 cursor-grab rounded-lg border-2 transition-all ${
                        dragIndex === i
                            ? "opacity-40 border-amber-400"
                            : overIndex === i
                            ? "border-amber-500 scale-105"
                            : "border-line"
                    }`}
                >
                    <img
                        src={getPreview(file)}
                        alt={`Imagen ${i + 1}`}
                        className="h-24 w-24 rounded-lg object-cover pointer-events-none"
                    />
                    {i === 0 && (
                        <span className="absolute top-1 left-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            Portada
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}