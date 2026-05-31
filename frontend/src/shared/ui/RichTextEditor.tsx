"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";

type Props = {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
};

const MenuButton = ({
    onClick,
    active,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onMouseDown={(e) => {
            e.preventDefault(); // evita que el editor pierda el foco
            onClick();
        }}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            active
                ? "bg-earth-brown text-cream"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
        }`}
    >
        {children}
    </button>
);

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
    // Este counter fuerza re-render cuando cambia el estado del editor
    const [, setTick] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
            }),
            Underline,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({
                placeholder: placeholder ?? "Empezá a escribir...",
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onTransaction: () => {
            // Fuerza re-render para actualizar los botones activos
            setTick((t) => t + 1);
        },
        editorProps: {
            attributes: {
                class: "tiptap-content min-h-48 p-4 focus:outline-none",
            },
        },
    });

    useEffect(() => {
        if (editor && content && !editor.isFocused && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt("URL del enlace:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="rounded-lg border border-line overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 border-b border-line bg-zinc-50 p-2">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                >
                    <strong>N</strong>
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                >
                    <em>I</em>
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                >
                    <u>U</u>
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                >
                    <s>S</s>
                </MenuButton>

                <span className="mx-1 border-l border-zinc-300" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                >
                    H2
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                >
                    H3
                </MenuButton>

                <span className="mx-1 border-l border-zinc-300" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                >
                    • Lista
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                >
                    1. Lista
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                >
                    " Cita
                </MenuButton>

                <span className="mx-1 border-l border-zinc-300" />

                <MenuButton onClick={addLink} active={editor.isActive("link")}>
                    🔗 Link
                </MenuButton>
                {editor.isActive("link") && (
                    <MenuButton onClick={() => editor.chain().focus().unsetLink().run()}>
                        ✕ Link
                    </MenuButton>
                )}

                <span className="mx-1 border-l border-zinc-300" />

                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    active={editor.isActive({ textAlign: "left" })}
                >
                    ⬅
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    active={editor.isActive({ textAlign: "center" })}
                >
                    ⬌
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    active={editor.isActive({ textAlign: "right" })}
                >
                    ➡
                </MenuButton>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* Estilos del contenido del editor */}
            <style jsx global>{`
                .tiptap-content h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 1rem 0 0.5rem;
                }
                .tiptap-content h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.5rem;
                }
                .tiptap-content p {
                    margin: 0.5rem 0;
                }
                .tiptap-content ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .tiptap-content ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .tiptap-content li {
                    margin: 0.25rem 0;
                }
                .tiptap-content li p {
                    margin: 0;
                }
                .tiptap-content blockquote {
                    border-left: 3px solid #a8a29e;
                    padding-left: 1rem;
                    margin: 0.75rem 0;
                    color: #57534e;
                    font-style: italic;
                }
                .tiptap-content a {
                    color: #7c5e3c;
                    text-decoration: underline;
                }
                .tiptap-content .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #a8a29e;
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
}