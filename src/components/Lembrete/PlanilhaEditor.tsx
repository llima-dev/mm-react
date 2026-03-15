import { useEffect, useRef } from "react";
import jspreadsheet from "jspreadsheet-ce";
import type { WorksheetInstance } from "jspreadsheet-ce";

import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

import type { Planilha } from "../../types";
import "./PlanilhaEditor.css"

type Props = {
  data?: Planilha;
  onChange?: (data: Planilha) => void;
  isDrawer?: boolean;
};

export default function PlanilhaEditor(
  { 
    data = { data: [[]], style: {}, columns: [] }, 
    onChange, 
    isDrawer = true 
  }: Props
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (ref.current.dataset.jssInit) return;
    ref.current.dataset.jssInit = "true";

    jspreadsheet(ref.current, {
      worksheets: [
        {
          data: data.data as unknown as jspreadsheet.CellValue[][],
          style: data.style,
          minDimensions: [10, 20],
          columns: data?.columns ?? [],
          tableOverflow: true,
          tableWidth: "100%",
          editable: !isDrawer
        }
      ],
      toolbar: !isDrawer,

      onchange: (worksheet: WorksheetInstance) => {
        const dados = worksheet.getData();
        const estilos = worksheet.getStyle();

        onChange?.({
          data: dados,
          style: typeof estilos === "string" ? {} : estilos
        });
      },

      onchangestyle: (worksheet: WorksheetInstance) => {
        const dados = worksheet.getData();
        const estilos = worksheet.getStyle();

        onChange?.({
          data: dados,
          style: typeof estilos === "string" ? {} : estilos
        });
      },

      onresizecolumn: (worksheet: WorksheetInstance) => {
        const dados = worksheet.getData();
        const estilos = worksheet.getStyle();
        const widths = worksheet.getWidth();

        const cols = Array.isArray(widths) ? widths : [widths];

        onChange?.({
          data: dados,
          style: typeof estilos === "string" ? {} : estilos,
          columns: cols.map((w) => ({ width: Number(w) }))
        });
      },

      onload: (instance) => {
        const worksheet = instance.worksheets[0];

        if (!data?.columns) return;

        data.columns.forEach((col, i) => {
          if (col?.width) {
            worksheet.setWidth(i, col.width);
          }
        });
      }
    });

    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
        delete ref.current.dataset.jssInit;
      }
    };
  }, []);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}