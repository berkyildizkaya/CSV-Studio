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
  // Takip durumları
  dirtyCells: Set<string>; // "uId-columnId" formatında
  newColumns: Set<string>; // "columnId" formatında
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
    dirtyCells: new Set(),
    newColumns: new Set(),
  });

  const loadCsvFile = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "CSV Dosyaları", extensions: ["csv", "txt"] }],
      });

      if (!selected) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      let filePath = typeof selected === "string" ? selected : (selected as any).path;
      if (!filePath) throw new Error("Dosya yolu alınamadı.");

      let content = await readAndDecodeFile(filePath);
      let delimiter = "";

      const firstLineEndIndex = content.indexOf('\n');
      if (firstLineEndIndex !== -1) {
        const firstLine = content.substring(0, firstLineEndIndex).trim();
        if (firstLine.startsWith("sep=")) {
           delimiter = firstLine.substring(4).trim();
           content = content.substring(firstLineEndIndex + 1);
        }
      }

      Papa.parse(content, {
        header: true,
        delimiter: delimiter,
        skipEmptyLines: true,
        complete: (results) => {
            const rawData = results.data;
            const headers = rawData.length > 0 ? Object.keys(rawData[0] as object) : [];
            
            // Her satıra takip için benzersiz kimlik ekle
            const dataWithIds = rawData.map((row: any, idx: number) => ({
                ...row,
                _uId: `row-${idx}-${Math.random().toString(36).substr(2, 9)}`
            }));

            setState({
                data: dataWithIds,
                headers,
                fileName: filePath,
                delimiter: results.meta.delimiter || ",",
                rowCount: dataWithIds.length,
                isLoading: false,
                error: null,
                dirtyCells: new Set(),
                newColumns: new Set(),
            });
            toast.success(t('toast.file_loaded'));
        },
        error: (error: Error) => {
            toast.error(`${t('toast.parse_error')}: ${error.message}`);
            setState(prev => ({ ...prev, isLoading: false }));
        }
      });
    } catch (err: any) {
      toast.error(`${t('toast.load_error')}: ${err.message || err}`);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [t]);

  const saveCsvFile = useCallback(async (
    saveAs: boolean = false, 
    config?: { delimiter: string, includeSep: boolean, includeBom: boolean }
  ) => {
    if (!state.data || state.data.length === 0) return;

    try {
      let filePath = state.fileName;
      if (saveAs || !filePath) {
        const selectedPath = await save({
          title: saveAs ? t('app.save_as') : t('app.save'),
          filters: [{ name: "CSV Dosyası", extensions: ["csv"] }],
          defaultPath: filePath || "data.csv",
        });
        if (!selectedPath) return;
        filePath = selectedPath;
      }

      const toastId = toast.loading(t('toast.saving'));
      
      // _uId alanını temizleyerek kaydet
      const dataToSave = state.data.map(({ _uId, ...rest }) => rest);

      const csvContent = Papa.unparse({
        fields: state.headers,
        data: dataToSave
      }, {
        quotes: true,
        delimiter: config?.delimiter || state.delimiter,
        header: true,
      });

      const finalContent = config?.includeSep ? `sep=${config.delimiter || state.delimiter}\n${csvContent}` : csvContent;
      await saveFileContent(filePath, finalContent, config?.includeBom);

      // Kayıt başarılıysa "dirty" durumlarını temizle
      setState((prev) => ({
        ...prev, 
        fileName: filePath, 
        dirtyCells: new Set(), 
        newColumns: new Set() 
      }));
      
      toast.success(t('toast.file_saved'), { id: toastId });
    } catch (err: any) {
      toast.error(`${t('toast.save_error')}: ${err.message || err}`);
    }
  }, [state.data, state.fileName, state.delimiter, state.headers, t]);
      
  const updateCell = useCallback((rowIndex: number, columnId: string, value: any) => {
    setState((prev) => {
      const row = prev.data[rowIndex];
      if (!row) return prev;

      const newData = [...prev.data];
      newData[rowIndex] = { ...row, [columnId]: value };
      
      const newDirtyCells = new Set(prev.dirtyCells);
      newDirtyCells.add(`${row._uId}-${columnId}`);

      return { ...prev, data: newData, dirtyCells: newDirtyCells };
    });
  }, []);

  const insertRow = useCallback((rowIndex: number, newRowData?: any) => {
    setState((prev) => {
      const uId = `row-new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const rowToAdd = {
        ...(newRowData || prev.headers.reduce((acc, h) => ({ ...acc, [h]: "" }), {})),
        _uId: uId
      };
      
      const newData = [...prev.data];
      newData.splice(rowIndex, 0, rowToAdd);
      
      // Yeni satırın tüm hücrelerini "dirty" olarak işaretle (isteğe bağlı)
      const newDirtyCells = new Set(prev.dirtyCells);
      prev.headers.forEach(h => newDirtyCells.add(`${uId}-${h}`));
      
      return { ...prev, data: newData, rowCount: newData.length, dirtyCells: newDirtyCells };
    });
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    setState((prev) => {
      const row = prev.data[rowIndex];
      const newData = [...prev.data];
      newData.splice(rowIndex, 1);
      
      // Silinen satırın dirty kayıtlarını temizle
      const newDirtyCells = new Set(prev.dirtyCells);
      if (row?._uId) {
          Array.from(newDirtyCells).forEach(cellKey => {
              if (cellKey.startsWith(`${row._uId}-`)) newDirtyCells.delete(cellKey);
          });
      }

      return { ...prev, data: newData, rowCount: newData.length, dirtyCells: newDirtyCells };
    });
  }, []);

  const updateRow = useCallback((rowIndex: number, newRowData: any) => {
    setState((prev) => {
      const row = prev.data[rowIndex];
      if (!row) return prev;

      const newData = [...prev.data];
      newData[rowIndex] = { ...newRowData, _uId: row._uId };
      
      const newDirtyCells = new Set(prev.dirtyCells);
      Object.keys(newRowData).forEach(colId => {
          if (newRowData[colId] !== row[colId]) {
              newDirtyCells.add(`${row._uId}-${colId}`);
          }
      });

      return { ...prev, data: newData, dirtyCells: newDirtyCells };
    });
  }, []);

  const deleteMultipleRows = useCallback((rowIndices: number[]) => {
    setState((prev) => {
      const indicesToDelete = new Set(rowIndices);
      const rowsToDelete = prev.data.filter((_, idx) => indicesToDelete.has(idx));
      const newData = prev.data.filter((_, index) => !indicesToDelete.has(index));
      
      const newDirtyCells = new Set(prev.dirtyCells);
      rowsToDelete.forEach(row => {
          Array.from(newDirtyCells).forEach(cellKey => {
              if (cellKey.startsWith(`${row._uId}-`)) newDirtyCells.delete(cellKey);
          });
      });

      return { ...prev, data: newData, rowCount: newData.length, dirtyCells: newDirtyCells };
    });
  }, []);

  const findAndReplace = useCallback((findText: string, replaceText: string, columnId: string = "all", caseSensitive: boolean = false) => {
    let affectedRows = 0;
    setState((prev) => {
      const newDirtyCells = new Set(prev.dirtyCells);
      const newData = prev.data.map((row) => {
        let rowChanged = false;
        const newRow = { ...row };
        const targetColumns = columnId === "all" ? prev.headers : [columnId];

        targetColumns.forEach((col) => {
          const originalValue = String(newRow[col] || "");
          let newValue = originalValue;
          if (caseSensitive) {
             if (originalValue.includes(findText)) newValue = originalValue.split(findText).join(replaceText);
          } else {
             const regex = new RegExp(findText.replace(/[.*+?^${}()|[\\]/g, '\\$&'), 'gi');
             if (regex.test(originalValue)) newValue = originalValue.replace(regex, replaceText);
          }

          if (newValue !== originalValue) {
            newRow[col] = newValue;
            newDirtyCells.add(`${row._uId}-${col}`);
            rowChanged = true;
          }
        });

        if (rowChanged) affectedRows++;
        return newRow;
      });
      return { ...prev, data: newData, dirtyCells: newDirtyCells };
    });
    return affectedRows;
  }, []);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newHeaders = [...prev.headers];
      const [movedColumn] = newHeaders.splice(fromIndex, 1);
      newHeaders.splice(toIndex, 0, movedColumn);
      return { ...prev, headers: newHeaders, data: [...prev.data] };
    });
  }, []);

  const renameColumn = useCallback((oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    setState((prev) => {
      const newHeaders = prev.headers.map(h => h === oldName ? newName : h);
      const newColumns = new Set(prev.newColumns);
      if (newColumns.has(oldName)) {
          newColumns.delete(oldName);
          newColumns.add(newName);
      }
      
      const newDirtyCells = new Set<string>();
      prev.dirtyCells.forEach(cellKey => {
          if (cellKey.endsWith(`-${oldName}`)) {
              newDirtyCells.add(cellKey.replace(`-${oldName}`, `-${newName}`));
          } else {
              newDirtyCells.add(cellKey);
          }
      });

      const newData = prev.data.map(row => {
        const newRow = { ...row };
        newRow[newName] = newRow[oldName];
        delete newRow[oldName];
        return newRow;
      });
      return { ...prev, headers: newHeaders, data: newData, newColumns, dirtyCells: newDirtyCells };
    });
  }, []);

  const addColumn = useCallback((columnName: string, index?: number) => {
    if (!columnName) return;
    setState((prev) => {
      if (prev.headers.includes(columnName)) {
        toast.error(t('toast.column_exists'));
        return prev;
      }
      const newHeaders = [...prev.headers];
      if (typeof index === 'number') newHeaders.splice(index, 0, columnName);
      else newHeaders.push(columnName);

      const newColumns = new Set(prev.newColumns);
      newColumns.add(columnName);

      const newData = prev.data.map(row => ({ ...row, [columnName]: "" }));
      return { ...prev, headers: newHeaders, data: newData, newColumns };
    });
  }, [t]);

  const deleteColumn = useCallback((columnName: string) => {
    setState((prev) => {
      const newHeaders = prev.headers.filter(h => h !== columnName);
      const newColumns = new Set(prev.newColumns);
      newColumns.delete(columnName);
      
      const newDirtyCells = new Set(prev.dirtyCells);
      Array.from(newDirtyCells).forEach(cellKey => {
          if (cellKey.endsWith(`-${columnName}`)) newDirtyCells.delete(cellKey);
      });

      const newData = prev.data.map(row => {
        const newRow = { ...row };
        delete newRow[columnName];
        return newRow;
      });
      return { ...prev, headers: newHeaders, data: newData, newColumns, dirtyCells: newDirtyCells };
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