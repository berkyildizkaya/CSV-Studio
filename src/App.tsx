import { useMemo } from "react";
import { useCsv } from "@/hooks/use-csv";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export default function App() {
  const { fileName, rowCount, headers, data, isLoading, error, loadCsvFile } = useCsv();

  // CSV başlıklarından tablo sütunlarını dinamik olarak oluştur
  const columns = useMemo(() => {
    return headers.map((header) => ({
      id: header, // Benzersiz ID (accessorKey yerine)
      accessorFn: (row: any) => row[header], // Veriye doğrudan erişim
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground w-full"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="truncate" title={header}>{header}</span>
            <ArrowUpDown className="ml-1 h-3 w-3 shrink-0" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="truncate text-sm w-full" title={row.getValue(header)}>
          {row.getValue(header)}
        </div>
      ),
      size: 150, // Varsayılan genişlik
      minSize: 50,
      maxSize: 500,
      enableSorting: true,
      enableGlobalFilter: true,
    } as ColumnDef<any>));
  }, [headers]);

  if (data.length > 0) {
    return (
      <div className="flex flex-col h-screen w-full bg-background text-foreground">
        {/* Üst Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 gap-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <h1 className="text-xl font-bold tracking-tight shrink-0">CSV Studio</h1>
            <div className="text-sm text-muted-foreground border-l pl-4 flex items-center gap-2 overflow-hidden">
              <span className="font-semibold text-foreground truncate" title={fileName || ""}>
                {fileName?.split(/[\\/]/).pop()}
              </span>
              <span className="mx-2 shrink-0">•</span>
              <span className="shrink-0">{rowCount.toLocaleString()} satır</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
             <button
              onClick={loadCsvFile}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Farklı Dosya Aç
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              Dışa Aktar
            </button>
          </div>
        </div>

        {/* Tablo Alanı */}
        <div className="flex-1 overflow-hidden p-4">
           <DataTable columns={columns} data={data} />
        </div>
      </div>
    );
  }

  // Başlangıç / Yükleme Ekranı
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">CSV Studio</h1>
        <p className="text-muted-foreground">Hızlı ve güvenli CSV düzenleyici</p>
      </div>

      <div className="flex flex-col items-center gap-4 border p-12 rounded-xl bg-card shadow-sm border-dashed border-2 w-full max-w-md">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm font-medium w-full text-center">
            {error}
          </div>
        )}

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Düzenlemek için bir CSV dosyası seçin</p>
        </div>

        <button
          onClick={loadCsvFile}
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
        >
          {isLoading ? "Yükleniyor..." : "CSV Dosyası Aç"}
        </button>
      </div>
    </div>
  );
}