import { FilterFn } from "@tanstack/react-table";

/**
 * Seçili değerlere göre filtrele
 * filterValue: string[] - seçili değerler dizisi
 */
export const multiSelectFilter: FilterFn<any> = (row, columnId, filterValue: string[]) => {
  // Filtre boşsa tüm satırları göster
  if (!filterValue || filterValue.length === 0) return true;

  const cellValue = row.getValue(columnId);
  const strValue = cellValue !== undefined && cellValue !== null ? String(cellValue).trim() : '';

  return filterValue.includes(strValue);
};

/**
 * Custom filter fonksiyonları - TanStack Table'a eklenecek
 */
export const customFilterFns = {
  multiSelect: multiSelectFilter,
};
