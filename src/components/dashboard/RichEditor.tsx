import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Undo, Redo, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { uploadImage } from '../../lib/storage';

interface RichEditorProps {
  content: any;
  onChange: (json: any) => void;
  bucket?: string;
}

function normalizeContent(content: any) {
  if (!content) return '';
  if (typeof content === 'object') {
    if (content.type === 'doc') return content;
    if (content.html) return content.html;
    return content;
  }
  if (typeof content === 'string') {
    try {
      const p = JSON.parse(content);
      if (p.type === 'doc') return p;
      return content;
    } catch { return content; }
  }
  return '';
}

export default function RichEditor({ content, onChange, bucket = 'blog-images',   placeholder }: RichEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: normalizeContent(content),
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) return <div className="h-48 bg-gray-900/50 rounded-xl animate-pulse" />;

  const ToolBtn = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={`p-2 rounded-lg text-sm transition-colors ${active ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
      {children}
    </button>
  );

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, bucket);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Αποτυχία μεταφόρτωσης εικόνας. Βεβαιωθείτε ότι έχετε τρέξει το script apply-storage-rls.mjs.');
    } finally {
      setUploading(false);
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(file);
    };
    input.click();
  };

  const addImageUrl = () => {
    const url = window.prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt('Link URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-gray-800 bg-gray-900/50 flex-wrap">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={16} /></ToolBtn>
        <span className="w-px h-5 bg-gray-800 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote size={16} /></ToolBtn>
        <span className="w-px h-5 bg-gray-800 mx-1" />
        <div className="relative">
          <ToolBtn onClick={addImage}>
            {uploading ? <span className="size-4 inline-block border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : <ImageIcon size={16} />}
          </ToolBtn>
          <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block">
            <button onClick={addImageUrl} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 hover:text-white whitespace-nowrap">Από URL</button>
          </div>
        </div>
        <ToolBtn onClick={addLink} active={editor.isActive('link')}><LinkIcon size={16} /></ToolBtn>
        <span className="w-px h-5 bg-gray-800 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
