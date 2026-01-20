import { useState, useCallback } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import Papa from "papaparse";
import { readAndDecodeFile, saveFileContent } from "@/lib/file-utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CsvState {
  data: any[];
  headers: string[];
  fileName: string | null;
  delimiter: string;
  rowCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useCsv() {
  const { t } = useTranslation();
  const [state, setState] = useState<CsvState>({
    data: [],
    headers: [],
    fileName: null,
    delimiter: ",",
    rowCount: 0,
    isLoading: false,
    error: null,
  });

  const loadCsvFile = useCallback(async () => {
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
      } else if (typeof selected === "object" && selected !== null && "path" in selected) {
        // @ts-ignore
        filePath = selected.path;
      }

      if (!filePath) {
        throw new Error("Dosya yolu alınamadı.");
      }

      // Dosyayı oku ve decode et
      let content = await readAndDecodeFile(filePath);
      let delimiter = ""; // Boş bırakılırsa PapaParse otomatik algılar

      // "sep=" kontrolü (Excel metadata satırı)
      const firstLineEndIndex = content.indexOf('\n');
      if (firstLineEndIndex !== -1) {
        const firstLine = content.substring(0, firstLineEndIndex).trim();
        if (firstLine.startsWith("sep=")) {
           delimiter = firstLine.substring(4).trim();
           content = content.substring(firstLineEndIndex + 1);
           console.log(`Excel separator detected: '${delimiter}'. First line removed.`);
        }
      }

      // Parse et
      Papa.parse(content, {
        header: true,
        delimiter: delimiter,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data;
            const headers = data.length > 0 ? Object.keys(data[0] as object) : [];
            const detectedDelimiter = results.meta.delimiter || ",";
            
            setState({
                data,
                headers,
                fileName: filePath,
                delimiter: detectedDelimiter,
                rowCount: data.length,
                isLoading: false,
                error: null,
            });
            toast.success(t('toast.file_loaded'), {
              description: `${filePath.split(/[\\/]/).pop()} (${data.length} ${t('app.rows')})`,
            });
        },
        error: (error: Error) => {
            const errorMsg = `${t('toast.parse_error')}: ${error.message}`;
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMsg,
            }));
            toast.error(errorMsg);
        }
      });
    } catch (err: any) {
      console.error("CSV Yükleme Hatası:", err);
      const errorMsg = `${t('toast.load_error')}: ${err.message || err}`;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      toast.error(errorMsg);
    }
  }, [t]);

  const saveCsvFile = useCallback(async (
    saveAs: boolean = false, 
    config?: { delimiter: string, includeSep: boolean, includeBom: boolean }
  ) => {
    if (!state.data || state.data.length === 0) {
      toast.error(t('toast.no_data_to_save'));
      return;
    }

    try {
      let filePath = state.fileName;
      const targetDelimiter = config?.delimiter || state.delimiter;
      const includeBom = config?.includeBom ?? true; // Varsayılan true

      // Eğer "Farklı Kaydet" isteniyorsa veya henüz bir dosya yolu yoksa
      if (saveAs || !filePath) {
        const selectedPath = await save({
          title: saveAs ? t('app.save_as') : t('app.save'),
          filters: [{ name: "CSV Dosyası", extensions: ["csv"] }],
          defaultPath: filePath || "data.csv",
        });

        if (!selectedPath) {
          return; // Kullanıcı iptal etti
        }
        filePath = selectedPath;
      }

      const toastId = toast.loading(t('toast.saving'));

      // Datayı CSV formatına çevir - Sütun sırasını state.headers'a göre zorla
      const csvContent = Papa.unparse({
        fields: state.headers,
        data: state.data
      }, {
        quotes: true, // Her hücreyi tırnak içine al (En güvenli yöntem)
        delimiter: targetDelimiter,
        header: true,
      });

      // Excel uyumluluk modu (sep=)
      const finalContent = config?.includeSep ? `sep=${targetDelimiter}\n${csvContent}` : csvContent;

      // Dosyaya yaz
      await saveFileContent(filePath, finalContent, includeBom);

      setState((prev) => ({ ...prev, fileName: filePath, delimiter: targetDelimiter }));
      
      toast.success(t('toast.file_saved'), {
        id: toastId,
        description: filePath.split(/[\\/]/).pop(),
      });

    } catch (err: any) {
      console.error("CSV Kaydetme Hatası:", err);
      toast.error(`${t('toast.save_error')}: ${err.message || err}`);
      setState((prev) => ({
        ...prev,
        error: `${t('toast.save_error')}: ${err.message || err}`,
      }));
    }
  }, [state.data, state.fileName, state.delimiter, state.headers, t]);
      
  const updateCell = useCallback((rowIndex: number, columnId: string, value: any) => {
    setState((prev) => {
      const newData = [...prev.data];
      newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
      return { ...prev, data: newData };
    });
  }, []);

  const insertRow = useCallback((rowIndex: number, newRowData?: any) => {
    setState((prev) => {
      // Eğer veri gelmediyse boş şablon oluştur
      const rowToAdd = newRowData || prev.headers.reduce((acc, header) => ({ ...acc, [header]: "" }), {});
      
      const newData = [...prev.data];
      // Belirtilen index'in önüne ekle
      newData.splice(rowIndex, 0, rowToAdd);
      
      return { ...prev, data: newData, rowCount: newData.length };
    });
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    setState((prev) => {
      const newData = [...prev.data];
      newData.splice(rowIndex, 1);
      return { ...prev, data: newData, rowCount: newData.length };
    });
  }, []);

  const updateRow = useCallback((rowIndex: number, newRowData: any) => {
    setState((prev) => {
      const newData = [...prev.data];
      newData[rowIndex] = newRowData;
      return { ...prev, data: newData };
    });
  }, []);

  const deleteMultipleRows = useCallback((rowIndices: number[]) => {
    setState((prev) => {
      const indicesToDelete = new Set(rowIndices);
      const newData = prev.data.filter((_, index) => !indicesToDelete.has(index));
      return { ...prev, data: newData, rowCount: newData.length };
    });
  }, []);

  const findAndReplace = useCallback((
    findText: string, 
    replaceText: string, 
    columnId: string = "all", 
    caseSensitive: boolean = false
  ) => {
    let affectedRows = 0;
    
    setState((prev) => {
      const newData = prev.data.map((row) => {
        let rowChanged = false;
        const newRow = { ...row };
        const targetColumns = columnId === "all" ? prev.headers : [columnId];

        targetColumns.forEach((col) => {
          const originalValue = String(newRow[col] || "");
          let newValue = originalValue;

          if (caseSensitive) {
             if (originalValue.includes(findText)) {
                 newValue = originalValue.split(findText).join(replaceText);
             }
          } else {
             const regex = new RegExp(findText.replace(/[.*+?^${}()|[\\]/g, '\\$&'), 'gi');
             if (regex.test(originalValue)) {
                 newValue = originalValue.replace(regex, replaceText);
             }
          }

          if (newValue !== originalValue) {
            newRow[col] = newValue;
            rowChanged = true;
          }
        });

        if (rowChanged) {
          affectedRows++;
          return newRow;
        }
        return row;
      });

      return { ...prev, data: newData };
    });
    
    return affectedRows;
  }, []);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newHeaders = [...prev.headers];
      const [movedColumn] = newHeaders.splice(fromIndex, 1);
      newHeaders.splice(toIndex, 0, movedColumn);
      
      // Veri referansını değiştirerek tablonun sütun değişikliğini fark etmesini garantile
      return { 
        ...prev, 
        headers: newHeaders,
        data: [...prev.data] 
      };
    });
  }, []);

  const renameColumn = useCallback((oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    
    setState((prev) => {
      // 1. Headers güncelle
      const newHeaders = prev.headers.map(h => h === oldName ? newName : h);
      
      // 2. Data içindeki tüm objelerin key'lerini güncelle
      const newData = prev.data.map(row => {
        const newRow = { ...row };
        newRow[newName] = newRow[oldName];
        delete newRow[oldName];
        return newRow;
      });
      
      return { ...prev, headers: newHeaders, data: newData };
    });
  }, []);

  const addColumn = useCallback((columnName: string, index?: number) => {
    if (!columnName) return;
    
    setState((prev) => {
      if (prev.headers.includes(columnName)) {
        toast.error(t('toast.column_exists', 'Bu isimde bir sütun zaten var.'));
        return prev;
      }
      
      const newHeaders = [...prev.headers];
      if (typeof index === 'number') {
        newHeaders.splice(index, 0, columnName);
      } else {
        newHeaders.push(columnName);
      }

      const newData = prev.data.map(row => ({
        ...row,
        [columnName]: ""
      }));
      
      return { ...prev, headers: newHeaders, data: newData };
    });
  }, [t]);

  const deleteColumn = useCallback((columnName: string) => {
    setState((prev) => {
      const newHeaders = prev.headers.filter(h => h !== columnName);
      const newData = prev.data.map(row => {
        const newRow = { ...row };
        delete newRow[columnName];
        return newRow;
      });
      
      return { ...prev, headers: newHeaders, data: newData };
    });
  }, []);

  return {
    ...state,
    loadCsvFile,
    saveCsvFile,
    updateCell,
    insertRow,
    deleteRow,
    updateRow,
    deleteMultipleRows,
    findAndReplace,
    moveColumn,
    renameColumn,
    addColumn,
    deleteColumn,
  };
}
