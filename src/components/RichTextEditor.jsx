import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const BOTONES = [
  { id: 'bold', etiqueta: 'B', titulo: 'Negrita', accion: (c) => c.toggleBold() },
  { id: 'italic', etiqueta: 'I', titulo: 'Cursiva', accion: (c) => c.toggleItalic() },
  { id: 'bulletList', etiqueta: '• Lista', titulo: 'Lista con viñetas', accion: (c) => c.toggleBulletList() },
  { id: 'heading', etiqueta: 'H3', titulo: 'Subtítulo', accion: (c) => c.toggleHeading({ level: 3 }), attrs: { level: 3 } }
];

/* Editor de texto enriquecido (Tiptap). Props: value (HTML), onChange(html). */
export default function RichTextEditor({ value = '', onChange, id }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } })],
    content: value,
    editorProps: { attributes: { id, class: 'tiptap form-control', 'aria-label': 'Descripción del producto' } },
    onUpdate: ({ editor: e }) => onChange?.(e.isEmpty ? '' : e.getHTML())
  });

  if (!editor) return null;

  return (
    <div>
      <div className="btn-group btn-group-sm mb-2" role="toolbar" aria-label="Formato">
        {BOTONES.map((b) => (
          <button key={b.id} type="button" title={b.titulo}
            className={`btn btn-outline-secondary ${editor.isActive(b.id, b.attrs) ? 'active' : ''}`}
            onClick={() => b.accion(editor.chain().focus()).run()}>
            {b.etiqueta}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
