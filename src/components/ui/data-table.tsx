import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
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

function DataTableInner<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  })

  const { rows } = table.getRowModel()
  const visibleColumns = table.getVisibleFlatColumns()

  // Sanallaştırma için container referansı
  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45,
    overscan: 20, 
  })

  const { getVirtualItems: getVirtualRows, getTotalSize: getTotalRowHeight } = rowVirtualizer

  const virtualRows = getVirtualRows()
  
  // Tablonun toplam genişliğini hesapla
  const totalTableWidth = visibleColumns.reduce((acc, col) => acc + col.getSize(), 0)

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center">
        <input
          placeholder="Ara..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>
      
      <div 
        ref={tableContainerRef}
        className="rounded-md border flex-1 overflow-auto relative bg-card"
      >
        <Table 
          className="relative grid" 
          style={{ width: totalTableWidth, minWidth: "100%" }}
        >
          <TableHeader className="sticky top-0 bg-background z-20 shadow-sm border-b grid w-full">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id} 
                className="flex w-full hover:bg-transparent border-none"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      className="h-10 px-3 flex items-center border-r border-b overflow-hidden bg-muted/30"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="flex hover:bg-muted/50 absolute w-full transition-none border-b items-stretch"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`,
                    }}
                  >
                    {visibleCells.map((cell) => {
                       return (
                        <TableCell 
                          key={cell.id} 
                          className="p-3 flex items-center border-r overflow-hidden h-full min-h-[45px]"
                          style={{ width: cell.column.getSize() }}
                        >
                          <div className="w-full h-full flex items-center overflow-hidden min-h-[20px]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                       )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="flex w-full">
                <TableCell 
                  colSpan={visibleColumns.length} 
                  className="h-24 text-center w-full flex items-center justify-center"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
