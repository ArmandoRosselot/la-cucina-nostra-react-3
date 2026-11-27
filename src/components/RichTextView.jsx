import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

/* Muestra HTML de Tiptap en modo solo lectura.
   Tiptap solo conserva los elementos de su esquema, por eso no hace falta
   dangerouslySetInnerHTML (evita inyectar <script> guardados en la descripción). */
export default function RichTextView({ html }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: html,
    editable: false
  }, [html]);

  if (!html) return null;
  return <EditorContent editor={editor} className="lcn-richtext" />;
}
