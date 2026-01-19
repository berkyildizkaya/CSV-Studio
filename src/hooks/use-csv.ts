import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import Papa from "papaparse";
import { readAndDecodeFile } from "@/lib/file-utils";

interface CsvState {
  data: any[];
  headers: string[];
  fileName: string | null;
  rowCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useCsv() {
  const [state, setState] = useState<CsvState>({
    data: [],
    headers: [],
    fileName: null,
    rowCount: 0,
    isLoading: false,
    error: null,
  });

  const loadCsvFile = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "CSV Dosyaları",
            extensions: ["csv", "txt"],
          },
        ],
      });

      if (!selected) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      let filePath = "";
      if (typeof selected === "string") {
        filePath = selected;
      } else if (typeof selected === "object" && "path" in selected) {
        // @ts-ignore
        filePath = selected.path;
      }

      if (!filePath) {
        throw new Error("Dosya yolu alınamadı.");
      }

      // Dosyayı oku ve decode et
      const content = await readAndDecodeFile(filePath);

      // Parse et
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data;
            const headers = data.length > 0 ? Object.keys(data[0] as object) : [];
            
            setState({
                data,
                headers,
                fileName: filePath,
                rowCount: data.length,
                isLoading: false,
                error: null,
            });
        },
        error: (error: Error) => {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: `CSV Parse Hatası: ${error.message}`,
            }));
        }
      });

    } catch (err: any) {
      console.error("CSV Yükleme Hatası:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Dosya okuma hatası: ${err.message || err}`,
      }));
    }
  };

  return {
    ...state,
    loadCsvFile,
  };
}
