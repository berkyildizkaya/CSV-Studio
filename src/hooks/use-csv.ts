import { useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import Papa from "papaparse";
import { readAndDecodeFile, saveFileContent } from "@/lib/file-utils";
import { toast } from "sonner";

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
            
            setState({
                data,
                headers,
                fileName: filePath,
                rowCount: data.length,
                isLoading: false,
                error: null,
            });
            toast.success("Dosya başarıyla yüklendi", {
              description: `${filePath.split(/[\\/]/).pop()} (${data.length} satır)`,
            });
        },
        error: (error: Error) => {
            const errorMsg = `CSV Parse Hatası: ${error.message}`;
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
      const errorMsg = `Dosya okuma hatası: ${err.message || err}`;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      toast.error(errorMsg);
    }
  };

  const saveCsvFile = async (saveAs: boolean = false) => {
    if (!state.data || state.data.length === 0) {
      toast.error("Kaydedilecek veri bulunamadı.");
      return;
    }

    try {
      let filePath = state.fileName;

      // Eğer "Farklı Kaydet" isteniyorsa veya henüz bir dosya yolu yoksa
      if (saveAs || !filePath) {
        console.log("Opening save dialog...");
        const selectedPath = await save({
          title: saveAs ? "Farklı Kaydet" : "Dosyayı Kaydet",
          filters: [{ name: "CSV Dosyası", extensions: ["csv"] }],
          defaultPath: filePath || "data.csv",
        });

        console.log("Save dialog result:", selectedPath);
        if (!selectedPath) {
          return; // Kullanıcı iptal etti
        }
        filePath = selectedPath;
      }

      const toastId = toast.loading("Dosya kaydediliyor...");

      // Datayı CSV formatına çevir
      const csvContent = Papa.unparse(state.data, {
        quotes: true,
        header: true,
      });

      // Dosyaya yaz
      await saveFileContent(filePath, csvContent);

      setState((prev) => ({ ...prev, fileName: filePath }));
      
      toast.success("Dosya başarıyla kaydedildi", {
        id: toastId,
        description: filePath.split(/[\\/]/).pop(),
      });

    } catch (err: any) {
      console.error("CSV Kaydetme Hatası:", err);
      toast.error(`Kaydetme hatası: ${err.message || err}`);
      setState((prev) => ({
        ...prev,
        error: `Kaydetme hatası: ${err.message || err}`,
      }));
    }
  };
      
          const updateCell = (rowIndex: number, columnId: string, value: any) => {
            setState((prev) => {
              const newData = [...prev.data];
              newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
              return { ...prev, data: newData };
            });
          };
        
            const insertRow = (rowIndex: number, newRowData?: any) => {
              setState((prev) => {
                // Eğer veri gelmediyse boş şablon oluştur
                const rowToAdd = newRowData || prev.headers.reduce((acc, header) => ({ ...acc, [header]: "" }), {});
                
                const newData = [...prev.data];
                // Belirtilen index'in önüne ekle
                newData.splice(rowIndex, 0, rowToAdd);
                
                return { ...prev, data: newData, rowCount: newData.length };
              });
            };        
            const deleteRow = (rowIndex: number) => {
              setState((prev) => {
                const newData = [...prev.data];
                newData.splice(rowIndex, 1);
                return { ...prev, data: newData, rowCount: newData.length };
              });
            };
          
              const updateRow = (rowIndex: number, newRowData: any) => {
                setState((prev) => {
                  const newData = [...prev.data];
                  newData[rowIndex] = newRowData;
                  return { ...prev, data: newData };
                });
              };
            
                const deleteMultipleRows = (rowIndices: number[]) => {
                  setState((prev) => {
                    const indicesToDelete = new Set(rowIndices);
                    const newData = prev.data.filter((_, index) => !indicesToDelete.has(index));
                    return { ...prev, data: newData, rowCount: newData.length };
                  });
                };
              
                const findAndReplace = (
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
                           const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
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
                };
              
                  return {
                    ...state,
                    loadCsvFile,
                    saveCsvFile,
                    updateCell,
                    insertRow,                  deleteRow,
                  updateRow,
                  deleteMultipleRows,
                  findAndReplace,
                };
              }
