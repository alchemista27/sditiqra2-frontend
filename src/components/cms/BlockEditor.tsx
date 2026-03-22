// src/components/cms/BlockEditor.tsx
'use client';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState } from "react";

interface BlockEditorProps {
  initialContent?: string; // HTML string or JSON string from database
  onChange: (htmlContent: string) => void;
}

export default function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const [initialHTML, setInitialHTML] = useState<string | undefined>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialContent) {
        // Pass the HTML straight into the editor configuration
        setInitialHTML(initialContent);
      }
      setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialContent]);

  // Creates a new editor instance.
  const editor = useCreateBlockNote();

  useEffect(() => {
    if (isReady && initialHTML && editor) {
        const blocks = editor.tryParseHTMLToBlocks(initialHTML);
        // Sometimes it returns a promise in older versions, but here TS says it's synchronous Block[]
        // We'll wrap in Promise.resolve just in case, but since TS says it's an array, we can just use the array.
        if (Array.isArray(blocks)) {
           editor.replaceBlocks(editor.document, blocks);
        } else {
           Promise.resolve(blocks).then((b) => editor.replaceBlocks(editor.document, b));
        }
    }
  }, [isReady, initialHTML, editor]);

  if (!isReady || !editor) return <div className="p-12 text-center text-gray-400">Loading Native Block Editor...</div>;

  return (
    <div className="border-[1.5px] border-gray-200 rounded-xl overflow-hidden min-h-[500px] shadow-sm bg-white">
      <BlockNoteView 
        editor={editor} 
        theme="light"
        onChange={async () => {
          // Whenever the editor changes, extract the robust HTML output
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html);
        }}
        className="min-h-[500px]"
      />
    </div>
  );
}
