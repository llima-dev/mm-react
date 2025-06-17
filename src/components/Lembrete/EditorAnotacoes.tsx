import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faUndo,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  valorInicial: string;
  onSalvar: (conteudo: string) => void;
};

export default function EditorAnotacoes({ valorInicial, onSalvar }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: valorInicial,
  });

  const [ultimaVersaoSalva, setUltimaVersaoSalva] = useState(valorInicial);

  const valorAtual = editor?.getHTML() ?? "";
  const mudou = valorAtual !== ultimaVersaoSalva;
  const variant = mudou ? "outline-primary btn-sm" : "outline-secondary btn-sm";

  return (
    <div className="campo">
      {editor && (
        <>
          <div className="toolbar mb-2 d-flex gap-2 flex-wrap">
            <Button
              variant={editor.isActive("bold") ? "dark" : "outline-secondary"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <FontAwesomeIcon icon={faBold} />
            </Button>

            <Button
              variant={editor.isActive("italic") ? "dark" : "outline-secondary"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <FontAwesomeIcon icon={faItalic} />
            </Button>

            <Button
              variant={
                editor.isActive("bulletList") ? "dark" : "outline-secondary"
              }
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <FontAwesomeIcon icon={faListUl} />
            </Button>

            <Button
              variant={
                editor.isActive("orderedList") ? "dark" : "outline-secondary"
              }
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <FontAwesomeIcon icon={faListOl} />
            </Button>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
            >
              <FontAwesomeIcon icon={faUndo} />
            </Button>

            <Button
              variant="outline-success"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
            >
              <FontAwesomeIcon icon={faRedo} />
            </Button>
          </div>

          <EditorContent editor={editor} className="tiptap" />

          <Button
            variant={variant}
            size="sm"
            className="mt-2"
            disabled={!mudou}
            onClick={() => {
              if (editor) {
                const html = editor.getHTML();
                onSalvar(html);
                setUltimaVersaoSalva(html);
              }
            }}
          >
            Salvar Anotações
          </Button>
        </>
      )}
    </div>
  );
}
