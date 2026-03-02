'use client';
// src/components/cms/RichTextEditor.tsx
// Editor teks kaya WordPress-like menggunakan Tiptap v3
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ─── Tombol Toolbar ───────────────────────────────────────────
function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.3rem 0.5rem',
        background: active ? '#1B6B44' : 'transparent',
        color: active ? '#fff' : '#374151',
        border: 'none',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        minWidth: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 22, background: '#E5E7EB', margin: '0 0.25rem' }} />;
}

// ─── Komponen Utama Editor ────────────────────────────────────
export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'rich-text-link',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Mulai menulis konten di sini...',
      }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    onSelectionUpdate: ({ editor: e }) => {
      // Tampilkan bubble menu ketika ada teks yang diseleksi
      if (e.state.selection.empty) {
        setBubblePos(null);
        return;
      }
      const { from, to } = e.state.selection;
      if (from === to) { setBubblePos(null); return; }

      const domSel = window.getSelection();
      if (!domSel || domSel.rangeCount === 0) return;
      const range = domSel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapRect = editorWrapRef.current?.getBoundingClientRect();
      if (!wrapRect) return;
      setBubblePos({
        x: rect.left - wrapRect.left + rect.width / 2,
        y: rect.top - wrapRect.top - 44,
      });
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        style: 'min-height: 400px; outline: none; padding: 1.25rem; font-size: 15px; line-height: 1.7; font-family: inherit;',
      },
    },
  });

  const handleInsertImage = () => {
    const url = window.prompt('Masukkan URL gambar:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSetLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL link:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkToWordBoundary().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkToWordBoundary().setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div ref={editorWrapRef} style={{ border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff', position: 'relative' }}>

      {/* ─── TOOLBAR ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: '0.15rem', padding: '0.5rem 0.75rem',
        background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
      }}>
        {/* Heading */}
        <ToolbarButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <Divider />

        {/* Format teks */}
        <ToolbarButton title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><span style={{ textDecoration: 'underline' }}>U</span></ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><span style={{ textDecoration: 'line-through' }}>S</span></ToolbarButton>
        <ToolbarButton title="Kode Inline" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>code</span></ToolbarButton>
        <Divider />

        {/* List */}
        <ToolbarButton title="Bulleted List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_list_bulleted</span></ToolbarButton>
        <ToolbarButton title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_list_numbered</span></ToolbarButton>
        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Rata Kiri" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_align_left</span></ToolbarButton>
        <ToolbarButton title="Rata Tengah" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_align_center</span></ToolbarButton>
        <ToolbarButton title="Rata Kanan" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_align_right</span></ToolbarButton>
        <Divider />

        {/* Block elements */}
        <ToolbarButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_quote</span></ToolbarButton>
        <ToolbarButton title="Code Block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>integration_instructions</span></ToolbarButton>
        <ToolbarButton title="Garis Pemisah (HR)" onClick={() => editor.chain().focus().setHorizontalRule().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>horizontal_rule</span></ToolbarButton>
        <Divider />

        {/* Link & Image */}
        <ToolbarButton title="Insert / Edit Link" active={editor.isActive('link')} onClick={handleSetLink}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>link</span></ToolbarButton>
        <ToolbarButton title="Insert Image (dari URL)" onClick={handleInsertImage}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span></ToolbarButton>
        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>undo</span></ToolbarButton>
        <ToolbarButton title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>redo</span></ToolbarButton>
      </div>

      {/* ─── INLINE BUBBLE MENU ──────────────────────────── */}
      {bubblePos && (
        <div
          style={{
            position: 'absolute',
            left: bubblePos.x,
            top: bubblePos.y,
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.2rem',
            background: '#111827',
            borderRadius: 8,
            padding: '0.3rem 0.4rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            zIndex: 50,
            pointerEvents: 'auto',
          }}
        >
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
            style={{ padding: '0.2rem 0.4rem', background: editor.isActive('bold') ? '#1B6B44' : 'transparent', color: '#D1FAE5', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>
            B
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{ padding: '0.2rem 0.4rem', background: editor.isActive('italic') ? '#1B6B44' : 'transparent', color: '#D1FAE5', border: 'none', borderRadius: 4, cursor: 'pointer', fontStyle: 'italic' }}>
            I
          </button>
          <button type="button" onClick={handleSetLink}
            style={{ padding: '0.2rem 0.4rem', background: editor.isActive('link') ? '#1B6B44' : 'transparent', color: '#D1FAE5', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
          </button>
        </div>
      )}

      {/* ─── EDITOR CONTENT ──────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ─── WORD COUNT ──────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #F3F4F6', padding: '0.4rem 1.25rem', fontSize: 12, color: '#9CA3AF', display: 'flex', justifyContent: 'space-between' }}>
        <span>{editor.getText().length} karakter</span>
        <span>{editor.getText().split(/\s+/).filter(Boolean).length} kata</span>
      </div>

      {/* ─── CSS ─────────────────────────────────────────── */}
      <style>{`
        .tiptap-editor:focus { outline: none; }
        .tiptap-editor p { margin: 0 0 0.75em 0; }
        .tiptap-editor h1 { font-size: 2em; font-weight: 800; margin: 1rem 0 0.5rem; color: #111827; line-height: 1.2; }
        .tiptap-editor h2 { font-size: 1.5em; font-weight: 700; margin: 1rem 0 0.5rem; color: #111827; line-height: 1.3; }
        .tiptap-editor h3 { font-size: 1.25em; font-weight: 600; margin: 0.75rem 0 0.4rem; color: #111827; }
        .tiptap-editor ul { padding-left: 1.5em; margin: 0.5em 0 0.75em; list-style: disc; }
        .tiptap-editor ol { padding-left: 1.5em; margin: 0.5em 0 0.75em; list-style: decimal; }
        .tiptap-editor li { margin: 0.2em 0; }
        .tiptap-editor blockquote {
          border-left: 4px solid #1B6B44;
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 1em 0; color: #4B5563;
          font-style: italic; background: #F0FDF4;
          border-radius: 0 8px 8px 0;
        }
        .tiptap-editor code {
          background: #F3F4F6; color: #DC2626;
          padding: 0.15em 0.4em; border-radius: 4px;
          font-family: 'JetBrains Mono','Fira Code',monospace; font-size: 0.875em;
        }
        .tiptap-editor pre {
          background: #1e1e2e; color: #cdd6f4;
          border-radius: 10px; padding: 1rem 1.25rem; margin: 1em 0; overflow-x: auto;
        }
        .tiptap-editor pre code { background: transparent; color: inherit; padding: 0; border-radius: 0; }
        .tiptap-editor img {
          max-width: 100%; height: auto;
          border-radius: 10px; margin: 1em 0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .tiptap-editor img.ProseMirror-selectednode { outline: 3px solid #1B6B44; }
        .rich-text-link { color: #1B6B44; text-decoration: underline; }
        .tiptap-editor p.is-editor-empty:first-child::before {
          color: #adb5bd; content: attr(data-placeholder);
          float: left; height: 0; pointer-events: none;
        }
        .tiptap-editor hr { border: none; border-top: 2px solid #E5E7EB; margin: 1.5em 0; }
      `}</style>
    </div>
  );
}
