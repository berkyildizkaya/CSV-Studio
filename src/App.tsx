import { useCsv } from "@/hooks/use-csv";

export default function App() {
  const { fileName, rowCount, headers, isLoading, error, loadCsvFile } = useCsv();

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

        {fileName ? (
          <div className="text-center space-y-4 w-full">
            <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium inline-block">
              Dosya Hazır
            </div>
            <p className="font-mono text-xs text-muted-foreground break-all">{fileName}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm w-full">
              <div className="bg-muted p-3 rounded flex flex-col items-center">
                <span className="block font-bold text-lg">{rowCount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Satır</span>
              </div>
              <div className="bg-muted p-3 rounded flex flex-col items-center">
                <span className="block font-bold text-lg">{headers.length}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sütun</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Düzenlemek için bir CSV dosyası seçin</p>
          </div>
        )}

        <button
          onClick={loadCsvFile}
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
        >
          {isLoading ? "Yükleniyor..." : fileName ? "Farklı Dosya Seç" : "CSV Dosyası Aç"}
        </button>
      </div>
    </div>
  );
}