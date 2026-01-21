import { useMemo, useState } from "react";
import { useCsv } from "@/hooks/use-csv";
import { DataTable } from "@/components/ui/data-table";
import { EditableCell } from "@/components/editable-cell";
import { SelectCell } from "@/components/select-cell";
import { FindReplaceDialog } from "@/components/find-replace-dialog";
import { SaveConfigDialog } from "@/components/save-config-dialog";
import { ColumnManagerDialog } from "@/components/column-manager-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowUpDown, Search, Save, ChevronDown, Languages, Columns } from "lucide-react";
import { ColumnFilterPopover } from "@/components/column-filter-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t, i18n } = useTranslation();
  const { 
    fileName, 
    rowCount, 
    headers, 
    data, 
    delimiter,
    isLoading, 
    error, 
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
    dirtyCells,
    newColumns
  } = useCsv();

  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isSaveConfigOpen, setIsSaveConfigOpen] = useState(false);
  const [isSaveAs, setIsSaveAs] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSaveClick = (as: boolean) => {
    setIsSaveAs(as);
    setIsSaveConfigOpen(true);
  };

  const handleSaveConfigConfirm = (config: { delimiter: string, includeSep: boolean, includeBom: boolean }) => {
    saveCsvFile(isSaveAs, config);
  };

  // CSV başlıklarından tablo sütunlarını dinamik olarak oluştur
  const columns = useMemo(() => {
    const dynamicColumns = headers.map((header) => ({
      id: header, // Benzersiz ID (accessorKey yerine)
      accessorFn: (row: any) => row[header], // Veriye doğrudan erişim
      filterFn: 'multiSelect',
      header: ({ column }: { column: Column<any> }) => {
        return (
          <div className="flex items-center gap-1 w-full">
            <button
              className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground flex-1 min-w-0"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span className="truncate" title={header}>{header}</span>
              <ArrowUpDown className="h-3 w-3 shrink-0" />
            </button>
            <ColumnFilterPopover
              columnId={header}
              data={data}
              currentFilter={column.getFilterValue() as string[] | undefined}
              onFilterChange={(value) => column.setFilterValue(value)}
            />
          </div>
        )
      },
      cell: ({ row, column, getValue, table }) => (
        <EditableCell
          getValue={getValue}
          rowIndex={row.index}
          columnId={column.id}
          updateData={updateCell}
          tableMeta={table.options.meta}
          rowData={row.original}
        />
      ),
      size: 150, // Varsayılan genişlik
      minSize: 50,
      maxSize: 500,
      enableSorting: true,
      enableGlobalFilter: true,
    } as ColumnDef<any>));

    // Seçim sütununu en başa ekle
    const selectionColumn: ColumnDef<any> = {
        id: "select",
        size: 40,
        minSize: 40,
        maxSize: 40,
        header: () => (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
             #
          </div>
        ),
        cell: ({ row }) => (
          <SelectCell 
            isSelected={row.getIsSelected()} 
            onToggle={row.toggleSelected} 
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
    };

    return [selectionColumn, ...dynamicColumns];
  }, [headers]);

  if (data.length > 0) {
    return (
      <div className="flex flex-col h-screen w-full bg-background text-foreground">
        {/* Üst Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 gap-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <h1 className="text-xl font-bold tracking-tight shrink-0">{t('app.title')}</h1>
            <div className="text-sm text-muted-foreground border-l pl-4 flex items-center gap-2 overflow-hidden">
              <span className="font-semibold text-foreground truncate" title={fileName || ""}>
                {fileName?.split(/[\\/]/).pop()}
              </span>
              <span className="mx-2 shrink-0">•</span>
              <span className="shrink-0">{rowCount.toLocaleString(i18n.language)} {t('app.rows')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        <Languages className="w-4 h-4 mr-2" />
                        {i18n.language.toUpperCase()}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changeLanguage('tr')}>Türkçe</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('de')}>Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setIsFindReplaceOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <Search className="w-4 h-4 mr-2" />
              {t('app.find_replace')}
            </button>
            <button
              onClick={() => setIsColumnManagerOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <Columns className="w-4 h-4 mr-2" />
              {t('app.manage_columns')}
            </button>
             <button
              onClick={loadCsvFile}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              {t('app.open_different_file')}
            </button>
            
            <div className="flex items-center rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9">
                <button 
                    onClick={() => handleSaveClick(false)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-l-md text-sm font-medium px-4 py-2 border-r border-primary-foreground/20 hover:bg-primary/90 h-full"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {t('app.save')}
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center px-2 py-2 rounded-r-md hover:bg-primary/90 h-full focus:outline-none">
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSaveClick(true)}>
                            {t('app.save_as')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tablo Alanı */}
        <div className="flex-1 overflow-hidden p-4">
           <DataTable 
             columns={columns} 
             data={data} 
             onInsertRow={insertRow}
             onDeleteRow={deleteRow}
             onUpdateRow={updateRow}
             onDeleteMultiple={deleteMultipleRows}
             onDeleteColumn={deleteColumn}
             dirtyCells={dirtyCells}
             newColumns={newColumns}
           />
        </div>
        
        <FindReplaceDialog 
            open={isFindReplaceOpen} 
            onOpenChange={setIsFindReplaceOpen} 
            headers={headers} 
            onFindAndReplace={findAndReplace} 
        />

        <ColumnManagerDialog
            open={isColumnManagerOpen}
            onOpenChange={setIsColumnManagerOpen}
            headers={headers}
            onMoveColumn={moveColumn}
            onRenameColumn={renameColumn}
            onAddColumn={addColumn}
            onDeleteColumn={deleteColumn}
        />

        <SaveConfigDialog 
            open={isSaveConfigOpen} 
            onOpenChange={setIsSaveConfigOpen} 
            defaultDelimiter={delimiter}
            onConfirm={handleSaveConfigConfirm}
        />
      </div>
    );
  }

  // Başlangıç / Yükleme Ekranı
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{t('app.title')}</h1>
        <p className="text-muted-foreground">{t('app.subtitle')}</p>
      </div>

      <div className="flex flex-col items-center gap-4 border p-12 rounded-xl bg-card shadow-sm border-dashed border-2 w-full max-w-md">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm font-medium w-full text-center">
            {error}
          </div>
        )}

        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('app.select_file_desc')}</p>
        </div>

        <button
          onClick={loadCsvFile}
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
        >
          {isLoading ? t('app.loading') : t('app.open_file')}
        </button>
      </div>
    </div>
  );
}