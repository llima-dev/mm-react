import { useEffect, useRef } from "react";
import jspreadsheet from "jspreadsheet-ce";

import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

import type { Planilha } from "../../types";

type Props = {
  data?: Planilha;
  onChange?: (data: Planilha) => void;
};

export default function PlanilhaEditor({ data = [[]], onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (ref.current.dataset.jssInit) return;
    ref.current.dataset.jssInit = "true";

    jspreadsheet(ref.current, {
      worksheets: [
        {
          data,
          minDimensions: [10, 10],
          columns: [],
        }
      ],
      onchange: (worksheet: any) => {
        const dados = worksheet.getData() as Planilha;
        onChange?.(dados);
      }
    });

    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
        delete ref.current.dataset.jssInit;
      }
    };
  }, []);

  return <div ref={ref} style={{ minHeight: 350, width: "100%" }} />;
}
