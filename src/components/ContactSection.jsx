import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import DOMPurify from 'dompurify';
import { crearMensaje } from '../data/db.js';
import { validarFormularioContacto } from '../utils/validaciones.js';

const VACIO = { nombre: '', email: '', mensaje: '' };
const LIMITE_CARACTERES = 2000;
const PROTOCOLO_SEGURO = /^(https?:\/\/|mailto:|tel:)/i;

/* Sanitiza el HTML del editor con una lista blanca limitada a lo que Tiptap puede generar aquí. */
const ETIQUETAS_PERMITIDAS = [
  'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'code',
  'ul', 'ol', 'li', 'blockquote', 'hr', 'a',
];
const ALINEACION = /text-align:\s*(left|center|right)/i;

function sanitizarHtml(html) {
  if (!html) return '';

  // Hook temporal: deja solo `text-align` en style y fuerza rel seguro en los enlaces.
  const hook = (nodo) => {
    if (nodo.hasAttribute?.('style')) {
      const alineacion = nodo.getAttribute('style').match(ALINEACION);
      if (alineacion) nodo.setAttribute('style', `text-align: ${alineacion[1].toLowerCase()}`);
      else nodo.removeAttribute('style');
    }
    if (nodo.tagName === 'A') {
      if (nodo.hasAttribute('target')) nodo.setAttribute('target', '_blank');
      nodo.setAttribute('rel', 'noopener noreferrer nofollow');
    }
  };

  DOMPurify.addHook('afterSanitizeAttributes', hook);
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ETIQUETAS_PERMITIDAS,
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
    });
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes', hook);
  }
}

/* Barra de herramientas del editor. Todos los botones son type="button" para no enviar el formulario. */
function BarraEditor({ editor }) {
  if (!editor) return null;

  const alternarEnlace = () => {
    const actual = editor.getAttributes('link').href || '';
    const entrada = window.prompt('Dirección del enlace (déjala vacía para quitarlo):', actual);
    if (entrada === null) return; // canceló
    const url = entrada.trim();
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href = PROTOCOLO_SEGURO.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const valorTitulo = [2, 3, 4].find((n) => editor.isActive('heading', { level: n }));

  const cambiarTitulo = (e) => {
    const nivel = Number(e.target.value);
    const cadena = editor.chain().focus();
    if (nivel) cadena.setHeading({ level: nivel }).run();
    else cadena.setParagraph().run();
  };

  const grupos = [
    [
      { id: 'bold', etiqueta: 'Negrita', contenido: <strong>B</strong>, activo: () => editor.isActive('bold'), accion: () => editor.chain().focus().toggleBold().run() },
      { id: 'italic', etiqueta: 'Cursiva', contenido: <em>I</em>, activo: () => editor.isActive('italic'), accion: () => editor.chain().focus().toggleItalic().run() },
      { id: 'underline', etiqueta: 'Subrayado', contenido: <u>U</u>, activo: () => editor.isActive('underline'), accion: () => editor.chain().focus().toggleUnderline().run() },
      { id: 'strike', etiqueta: 'Tachado', contenido: <s>S</s>, activo: () => editor.isActive('strike'), accion: () => editor.chain().focus().toggleStrike().run() },
      { id: 'highlight', etiqueta: 'Resaltado', contenido: <mark className="px-1">A</mark>, activo: () => editor.isActive('highlight'), accion: () => editor.chain().focus().toggleHighlight().run() },
      { id: 'code', etiqueta: 'Código en línea', contenido: <code>{'</>'}</code>, activo: () => editor.isActive('code'), accion: () => editor.chain().focus().toggleCode().run() },
    ],
    [
      { id: 'bulletList', etiqueta: 'Lista con viñetas', contenido: '• Lista', activo: () => editor.isActive('bulletList'), accion: () => editor.chain().focus().toggleBulletList().run() },
      { id: 'orderedList', etiqueta: 'Lista numerada', contenido: '1. Lista', activo: () => editor.isActive('orderedList'), accion: () => editor.chain().focus().toggleOrderedList().run() },
      { id: 'blockquote', etiqueta: 'Cita', contenido: '“ Cita', activo: () => editor.isActive('blockquote'), accion: () => editor.chain().focus().toggleBlockquote().run() },
    ],
    [
      { id: 'alignLeft', etiqueta: 'Alinear a la izquierda', contenido: 'Izq.', activo: () => editor.isActive({ textAlign: 'left' }), accion: () => editor.chain().focus().setTextAlign('left').run() },
      { id: 'alignCenter', etiqueta: 'Centrar', contenido: 'Centro', activo: () => editor.isActive({ textAlign: 'center' }), accion: () => editor.chain().focus().setTextAlign('center').run() },
      { id: 'alignRight', etiqueta: 'Alinear a la derecha', contenido: 'Der.', activo: () => editor.isActive({ textAlign: 'right' }), accion: () => editor.chain().focus().setTextAlign('right').run() },
    ],
    [
      { id: 'link', etiqueta: 'Enlace', contenido: 'Enlace', activo: () => editor.isActive('link'), accion: alternarEnlace },
      { id: 'hr', etiqueta: 'Línea separadora', contenido: '―', activo: () => false, accion: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    [
      { id: 'undo', etiqueta: 'Deshacer', contenido: '↶', activo: () => false, deshabilitado: !editor.can().undo(), accion: () => editor.chain().focus().undo().run() },
      { id: 'redo', etiqueta: 'Rehacer', contenido: '↷', activo: () => false, deshabilitado: !editor.can().redo(), accion: () => editor.chain().focus().redo().run() },
      { id: 'clear', etiqueta: 'Quitar formato', contenido: 'Tx', activo: () => false, accion: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    ],
  ];

  return (
    <div className="lcn-editor-barra d-flex flex-wrap align-items-center gap-2 mb-2" role="toolbar" aria-label="Formato del mensaje">
      <select
        className="form-select form-select-sm w-auto"
        aria-label="Estilo de párrafo"
        value={valorTitulo || 0}
        onChange={cambiarTitulo}
      >
        <option value={0}>Párrafo</option>
        <option value={2}>Título</option>
        <option value={3}>Subtítulo</option>
        <option value={4}>Encabezado menor</option>
      </select>

      {grupos.map((grupo, i) => (
        <div key={i} className="btn-group btn-group-sm" role="group">
          {grupo.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`btn ${b.activo() ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={b.accion}
              disabled={b.deshabilitado}
              title={b.etiqueta}
              aria-label={b.etiqueta}
              aria-pressed={b.activo()}
            >
              {b.contenido}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* Formulario de contacto con validación JS. Guarda el mensaje en db.js. */
export default function ContactSection() {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const editor = useEditor({
    extensions: [
      // En Tiptap v3 StarterKit ya incluye Link y Underline: se desactivan aquí
      // para configurarlos por separado (en v2 estas opciones se ignoran).
      StarterKit.configure({ link: false, underline: false, heading: { levels: [2, 3, 4] } }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Cuéntanos en qué podemos ayudarte…' }),
      CharacterCount.configure({ limit: LIMITE_CARACTERES }),
    ],
    content: '',
    shouldRerenderOnTransaction: true, // mantiene actualizado el estado activo de la barra
    editorProps: {
      attributes: {
        id: 'contacto-mensaje',
        class: 'lcn-editor-contenido',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Mensaje',
      },
    },
    onUpdate: ({ editor }) => {
      // Si el editor está vacío guardamos '' (y no '<p></p>') para que la validación funcione.
      setValores((v) => ({ ...v, mensaje: editor.isEmpty ? '' : editor.getHTML() }));
      setEnviado(false);
    },
  });

  const cambiar = (e) => {
    setValores((v) => ({ ...v, [e.target.name]: e.target.value }));
    setEnviado(false);
  };

  const enviar = (e) => {
    e.preventDefault();
    // Se sanitiza antes de validar: si el HTML queda vacío tras limpiarlo, el campo cuenta como vacío.
    const limpios = { ...valores, mensaje: sanitizarHtml(valores.mensaje) };
    const nuevos = validarFormularioContacto(limpios);
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    crearMensaje(limpios);
    setValores(VACIO);
    editor?.commands.clearContent(true);
    setEnviado(true);
  };

  const campo = (id, etiqueta, props = {}) => (
    <div className="mb-3">
      <label htmlFor={`contacto-${id}`} className="form-label">{etiqueta}</label>
      <input id={`contacto-${id}`} name={id} type={props.type || 'text'} className={`form-control ${errores[id] ? 'is-invalid' : ''}`}
        value={valores[id]} onChange={cambiar} aria-invalid={Boolean(errores[id])} />
      {errores[id] && <div className="invalid-feedback" role="alert">{errores[id]}</div>}
    </div>
  );

  const caracteres = editor?.storage.characterCount.characters() ?? 0;

  return (
    <section id="contacto" className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          <header className="lcn-section-title">
            <span>Escríbenos</span>
            <h2>Contacto</h2>
          </header>
          <div className="row justify-content-center">
            <div className="col-lg-7">
              {enviado && <div className="alert alert-success" role="status">¡Gracias! Recibimos tu mensaje y te responderemos pronto.</div>}
              <form onSubmit={enviar} noValidate>
                {campo('nombre', 'Nombre y apellido')}
                {campo('email', 'Correo electrónico', { type: 'email' })}

                <div className="mb-3">
                  <label htmlFor="contacto-mensaje" className="form-label">Mensaje</label>
                  <BarraEditor editor={editor} />
                  <div className={`form-control lcn-editor ${errores.mensaje ? 'is-invalid' : ''}`}>
                    <EditorContent editor={editor} />
                  </div>
                  <div className="form-text text-end">{caracteres} / {LIMITE_CARACTERES} caracteres</div>
                  {errores.mensaje && <div className="invalid-feedback d-block" role="alert">{errores.mensaje}</div>}
                </div>

                <button type="submit" className="btn lcn-btn-primary">Enviar mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
