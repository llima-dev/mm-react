import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faUndo,
  faRedo,
  faSpinner,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

import "./EditorAnotacoes.css";

type Props = {
  valorInicial: string;
  onSalvar: (conteudo: string) => void;
};

export default function EditorAnotacoes({ valorInicial, onSalvar }: Props) {
    const [salvando, setSalvando] = useState(false);
    const [ultimoSalvo, setUltimoSalvo] = useState(Date.now());
    const salvarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const editor = useEditor({
      extensions: [StarterKit],
      content: valorInicial,
      onBlur: ({ editor }) => {
        setSalvando(true);
        const html = editor.getHTML();
        onSalvar(html);

        if (salvarTimeoutRef.current) {
          clearTimeout(salvarTimeoutRef.current);
        }
        salvarTimeoutRef.current = setTimeout(() => {
          setSalvando(false);
          setUltimoSalvo(Date.now());
        }, 700);
      },
    });

    useEffect(() => {
      if (editor && valorInicial !== editor.getHTML()) {
        editor.commands.setContent(valorInicial || "");
      }
    }, [valorInicial, editor]);

  return (
    <div className="campo">
      {editor && (
        <>
          <div
            className="toolbar mb-2 d-flex align-items-center flex-wrap"
            style={{ gap: 2 }}
          >
            <Button
              variant="light"
              size="sm"
              className={
                editor.isActive("bold") ? "toolbar-btn active" : "toolbar-btn"
              }
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Negrito (Ctrl+B)"
            >
              <FontAwesomeIcon icon={faBold} />
            </Button>
            <Button
              variant="light"
              size="sm"
              className={
                editor.isActive("italic") ? "toolbar-btn active" : "toolbar-btn"
              }
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Itálico (Ctrl+I)"
            >
              <FontAwesomeIcon icon={faItalic} />
            </Button>
            <div className="toolbar-divider" />
            <Button
              variant="light"
              size="sm"
              className={
                editor.isActive("bulletList")
                  ? "toolbar-btn active"
                  : "toolbar-btn"
              }
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Lista não ordenada"
            >
              <FontAwesomeIcon icon={faListUl} />
            </Button>
            <Button
              variant="light"
              size="sm"
              className={
                editor.isActive("orderedList")
                  ? "toolbar-btn active"
                  : "toolbar-btn"
              }
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Lista ordenada"
            >
              <FontAwesomeIcon icon={faListOl} />
            </Button>
            <div className="toolbar-divider" />
            <Button
              variant="light"
              size="sm"
              className="toolbar-btn"
              onClick={() => editor.chain().focus().undo().run()}
              title="Desfazer (Ctrl+Z)"
            >
              <FontAwesomeIcon icon={faUndo} />
            </Button>
            <Button
              variant="light"
              size="sm"
              className="toolbar-btn"
              onClick={() => editor.chain().focus().redo().run()}
              title="Refazer (Ctrl+Y)"
            >
              <FontAwesomeIcon icon={faRedo} />
            </Button>
          </div>

          <EditorContent editor={editor} className="tiptap" />

           {/* Status de salvamento */}
          <div className="d-flex align-items-center mt-2" style={{ minHeight: 32 }}>
            {salvando ? (
              <span className="text-primary me-2" style={{ fontWeight: 500 }}>
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                Salvando...
              </span>
            ) : (
              <span className="text-success" style={{ fontWeight: 500 }}>
                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                Salvo
                <small className="text-muted ms-2">
                  ({new Date(ultimoSalvo).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                </small>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
