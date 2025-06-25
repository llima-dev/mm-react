import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "react-bootstrap";
import { HexColorPicker } from "react-colorful";

import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faUndo,
  faRedo,
  faSpinner,
  faCheckCircle,
  faTable,
  faArrowDown,
  faArrowUp,
  faArrowRight,
  faArrowLeft,
  faMinus,
  faTrash,
  faFilePdf,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";

import "./EditorAnotacoes.css";
import type { Lembrete } from "../../types";

type Props = {
  valorInicial: string;
  lembrete: Lembrete;
  onSalvar: (conteudo: string) => void;
};

interface jsPDFComAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export default function EditorAnotacoes({
  lembrete,
  valorInicial,
  onSalvar,
}: Props) {
  const [salvando, setSalvando] = useState(false);
  const [ultimoSalvo, setUltimoSalvo] = useState(Date.now());
  const salvarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cor, setCor] = useState("#000000");
  const [showPicker, setShowPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color, 
    ],
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

  async function handleInserirTabela() {
    const formValues = {
      linhas: 1,
      colunas: 3
    }

    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({
          rows: formValues.linhas,
          cols: formValues.colunas,
          withHeaderRow: true,
        })
        .run();
    }
  }

  useEffect(() => {
    if (editor && valorInicial !== editor.getHTML()) {
      editor.commands.setContent(valorInicial || "");
    }
  }, [valorInicial, editor]);

  
  function exportarPDF() {
    if (!editor) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const html = editor.getHTML();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(lembrete.titulo || "Anotação", 40, 60);

    let y = 90;

    Array.from(tempDiv.childNodes).forEach((node) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node as HTMLElement).tagName === "TABLE"
      ) {
        autoTable(doc, {
          html: node as HTMLTableElement,
          startY: y,
          styles: {
            lineColor: [80, 80, 80],
            lineWidth: 0.4,
            textColor: [40, 40, 40],
            fontSize: 11,
            halign: "left",
            valign: "middle",
            cellPadding: 5,
          },
          headStyles: {
            fillColor: [240, 244, 248],
            textColor: [20, 30, 50],
            fontStyle: "bold",
            lineWidth: 0.7,
            lineColor: [80, 80, 80],
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250],
          },
          tableLineWidth: 1,
          tableLineColor: [130, 130, 130],
        });

        const docAuto = doc as jsPDFComAutoTable;
        y = docAuto.lastAutoTable ? docAuto.lastAutoTable.finalY + 20 : y + 40;

      } else {
        const text = (node.textContent || "").trim();
        if (text) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text(text, 40, y, { maxWidth: 500 });
          y += 24;
        }
      }
    });

    doc.save((lembrete.titulo || "anotacao") + ".pdf");
  }

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
            <div style={{ position: "relative" }}>
              <button
                style={{
                  background: cor,
                  width: 32,
                  height: 28,
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 5,
                }}
                onClick={() => setShowPicker(!showPicker)}
              />
              {showPicker && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    top: 32,
                    left: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                  }}
                >
                  <HexColorPicker
                    color={cor}
                    onChange={(c) => {
                      setCor(c);
                      editor.chain().focus().setColor(c).run();
                    }}
                  />
                </div>
              )}
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center"
              style={{ padding: "0.25rem 0.5rem" }}
              onClick={() => editor.chain().focus().unsetColor().run()}
              title="Limpar cor"
            >
              <FontAwesomeIcon icon={faBroom} />
            </Button>
            <div className="toolbar-divider" />
            {editor && !editor.isActive("table") && (
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
            )}
            {editor && !editor.isActive("table") && (
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
            )}
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
            <div className="toolbar-divider" />
            {editor && !editor.isActive("table") && (
              <Button
                variant="light"
                size="sm"
                className="toolbar-btn"
                onClick={handleInserirTabela}
                title="Inserir tabela personalizada"
              >
                <FontAwesomeIcon icon={faTable} />
              </Button>
            )}

            {editor && editor.isActive("table") && (
              <>
                <Button
                  size="sm"
                  variant="light"
                  className="toolbar-btn"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Adicionar linha abaixo"
                >
                  <FontAwesomeIcon icon={faArrowDown} />{" "}
                  {/* ou faPlus, faTableRow, etc */}
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  className="toolbar-btn"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Adicionar linha acima"
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  className="toolbar-btn"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Adicionar coluna à direita"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  className="toolbar-btn"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  title="Adicionar coluna à esquerda"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  className="toolbar-btn"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Remover linha"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  className="toolbar-btn"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Remover coluna"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </>
            )}

            {editor && !editor.isActive("table") && (
              <Button
                variant="light"
                size="sm"
                className="toolbar-btn"
                onClick={() => exportarPDF()}
                title="Exportar PDF"
              >
                <FontAwesomeIcon icon={faFilePdf} />
              </Button>
            )}
          </div>

          <EditorContent editor={editor} className="tiptap" />

          {/* Status de salvamento */}
          <div
            className="d-flex align-items-center mt-2"
            style={{ minHeight: 32 }}
          >
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
                  (
                  {new Date(ultimoSalvo).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  )
                </small>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
