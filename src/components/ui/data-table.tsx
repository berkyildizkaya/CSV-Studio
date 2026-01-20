import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  RowSelectionState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useTranslation } from "react-i18next";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RowFormDialog } from "@/components/add-row-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onInsertRow?: (index: number, newData: any) => void
  onDeleteRow?: (index: number) => void
  onUpdateRow?: (index: number, newData: any) => void
  onDeleteMultiple?: (indices: number[]) => void
  onDeleteColumn?: (columnId: string) => void // Yeni Prop
  dirtyCells?: Set<string>
  newColumns?: Set<string>
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("DataTable Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          <h3 className="font-bold">Tablo Görüntüleme Hatası</h3>
          <p className="text-sm mt-2 font-mono whitespace-pre-wrap">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const DataTableRow = React.memo(({ 
    row, 
    virtualRow, 
    visibleCells,
    columnSizingInfo,
    isSelected,
    tableMeta // Yeni Prop
}: { 
    row: Row<any>, 
    virtualRow: any, 
    visibleCells: any[],
    columnSizingInfo: any,
    isSelected: boolean,
    tableMeta?: any // Yeni Tip
}) => {
    void columnSizingInfo;

    return (
      <TableRow
          data-state={isSelected && "selected"}
          className="flex hover:bg-muted/50 absolute w-full transition-none border-b items-stretch group"
          style={{
              transform: `translateY(${virtualRow.start}px)`,
              height: `${virtualRow.size}px`,
          }}
      >
          {visibleCells.map((cell) => {
              const isSelectColumn = cell.column.id === "select";
              const columnId = cell.column.id;
              const rowId = row.original?._uId;
              
              // Renklendirme mantığı
              const isDirty = tableMeta?.dirtyCells?.has(`${rowId}-${columnId}`);
              const isNewColumn = tableMeta?.newColumns?.has(columnId);

              return (
                  <TableCell
                      key={cell.id}
                      className={cn(
                        "flex items-center border-r overflow-hidden h-full min-h-[45px] transition-colors duration-200",
                        isSelectColumn ? "p-0" : "p-3",
                        // Değişen hücreler (Soft Yeşil/Turkuaz)
                        isDirty && "bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300",
                        // Yeni sütunlar (Soft Mavi)
                        isNewColumn && "bg-blue-50/60 dark:bg-blue-900/10 text-blue-900 dark:text-blue-300",
                        // Her ikisi birden (Daha belirgin yeşil)
                        isDirty && isNewColumn && "bg-emerald-100/80 dark:bg-emerald-800/30"
                      )}
                      style={{ width: cell.column.getSize() }}
                  >
                      <div className="w-full h-full flex items-center overflow-hidden min-h-[20px]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                  </TableCell>
              )
          })}
      </TableRow>
    );
}, (prevProps, nextProps) => {
    // Seçim durumu değişirse KESİN render et
    if (prevProps.isSelected !== nextProps.isSelected) return false;

    if (prevProps.row !== nextProps.row) return false;
    if (prevProps.virtualRow.start !== nextProps.virtualRow.start) return false;
    
    // Dirty veya NewColumn Set referansları değiştiyse render et
    if (prevProps.tableMeta?.dirtyCells !== nextProps.tableMeta?.dirtyCells) return false;
    if (prevProps.tableMeta?.newColumns !== nextProps.tableMeta?.newColumns) return false;

    if (prevProps.visibleCells !== nextProps.visibleCells) return false;
    if (prevProps.columnSizingInfo !== nextProps.columnSizingInfo) return false;
    
    return true; 
});


function DataTableInner<TData, TValue>({
  columns,
  data,
  onInsertRow,
  onDeleteRow,
  onUpdateRow,
  onDeleteMultiple,
  onDeleteColumn, // Eksik olan destructuring eklendi
  dirtyCells,
  newColumns
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("") // Yerel arama değeri
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [targetRowIndex, setTargetRowIndex] = React.useState<number | null>(null);
  const [editingRowData, setEditingRowData] = React.useState<any | null>(null);

  // Arama değerini debounce et
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  // Insert Dialog
  const handleOpenInsertDialog = React.useCallback((index: number) => {
    setTargetRowIndex(index);
    setEditingRowData(null); // Ekleme modu
    setIsDialogOpen(true);
  }, []);

  // Edit Dialog
  const handleOpenEditDialog = React.useCallback((index: number, data: any) => {
    setTargetRowIndex(index);
    setEditingRowData(data); // Düzenleme modu
    setIsDialogOpen(true);
  }, []);

  // Meta nesnesini memoize et (Hücrelerin gereksiz re-render olmasını engeller)
  const tableMeta = React.useMemo(() => ({
    onEditRow: handleOpenEditDialog,
    onInsertRow: handleOpenInsertDialog,
    onDeleteRow: onDeleteRow,
    onDeleteColumn, // Yeni Eklenen
    dirtyCells,
    newColumns
  }), [handleOpenEditDialog, handleOpenInsertDialog, onDeleteRow, onDeleteColumn, dirtyCells, newColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableRowSelection: true,
    getRowId: (_, index) => String(index), // Satırları indeks ile kimliklendir
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    // Meta üzerinden fonksiyonları hücrelere taşıyoruz
    meta: tableMeta
  })

  const { rows } = table.getRowModel()
  const columnSizingInfo = table.getState().columnSizingInfo; 
  
  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45,
    overscan: 10, 
  })

  const { getVirtualItems: getVirtualRows, getTotalSize: getTotalRowHeight } = rowVirtualizer

  const virtualRows = getVirtualRows()
  
  const totalTableWidth = table.getTotalSize()

  // Sütun başlıklarını çıkar (AccessorKey veya ID üzerinden)
  const headers = React.useMemo(() => {
     return columns.map(col => (col as any).accessorKey || col.id || "").filter(Boolean);
  }, [columns]);

  const handleSaveRow = (newData: any) => {
    if (targetRowIndex !== null) {
        if (editingRowData) {
            // Düzenleme kaydı
            onUpdateRow?.(targetRowIndex, newData);
        } else {
            // Ekleme kaydı
            onInsertRow?.(targetRowIndex, newData);
        }
    }
  };

  const handleDeleteSelected = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    if (onDeleteMultiple && selectedIndices.length > 0) {
        if (confirm(t('table.delete_confirm', { count: selectedIndices.length }))) {
            onDeleteMultiple(selectedIndices);
            setRowSelection({}); // Seçimi temizle
        }
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Generic Row Dialog (Add or Edit) */}
      <RowFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        headers={headers}
        sampleData={data as any[]}
        initialData={editingRowData} 
        onSave={handleSaveRow}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-card">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label={t('table.select_all')}
                />
                <span className="text-sm font-medium">{t('table.select_all')}</span>
            </div>

            <input
            placeholder={t('table.search_placeholder')}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-sm flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
        </div>
        
        {Object.keys(rowSelection).length > 0 && (
            <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected}
                className="animate-in fade-in zoom-in duration-200"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('table.delete_selected')} ({Object.keys(rowSelection).length})
            </Button>
        )}
      </div>
      
      <div 
        ref={tableContainerRef}
        className="rounded-md border flex-1 max-w-full overflow-auto relative bg-card custom-scrollbar"
      >
        <div style={{ width: totalTableWidth, minWidth: '100%', position: 'relative' }}>
          <table 
            className="relative grid w-full caption-bottom text-sm"
            style={{ width: '100%' }}
          >
            <TableHeader className="sticky top-0 bg-background z-30 shadow-md border-b grid w-full">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id} 
                className="flex w-full hover:bg-transparent border-none"
              >
                {headerGroup.headers.map((header) => {
                  const isNew = newColumns?.has(header.id);
                  return (
                    <TableHead 
                      key={header.id} 
                      className={`relative h-10 px-3 flex items-center border-r border-b overflow-hidden group transition-colors duration-200 ${isNew ? 'bg-blue-100/60 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-muted/30'}`}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/50 transition-colors
                          ${header.column.getIsResizing() ? "bg-primary w-1.5 opacity-100 z-10" : "opacity-0 group-hover:opacity-100 bg-border"}
                        `}
                      />
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody 
            className="grid w-full"
            style={{
              height: `${getTotalRowHeight()}px`,
              position: "relative",
            }}
          >
            {virtualRows.length > 0 ? (
              virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]
                const visibleCells = row.getVisibleCells()

                return (
                  <DataTableRow 
                    key={row.id} 
                    row={row} 
                    virtualRow={virtualRow} 
                    visibleCells={visibleCells} 
                    columnSizingInfo={columnSizingInfo}
                    isSelected={row.getIsSelected()}
                    tableMeta={tableMeta} // Prop'u geçir
                  />
                )
              })
            ) : (
              <TableRow className="flex w-full">
                <TableCell 
                  colSpan={table.getVisibleLeafColumns().length} 
                  className="h-24 text-center w-full flex items-center justify-center"
                >
                  {t('table.no_results')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
        </div>
      </div>
    </div>
  )
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return (
    <ErrorBoundary>
      <DataTableInner {...props} />
    </ErrorBoundary>
  )
}