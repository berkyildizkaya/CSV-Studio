export interface ColumnFilterInfo {
  uniqueValues: string[];
  totalCount: number;
}

/**
 * Bir sütundaki unique değerleri ve sayılarını döndürür
 */
export function getColumnUniqueValues(
  data: any[],
  columnId: string,
  limit: number = 100
): ColumnFilterInfo {
  const valueCountMap = new Map<string, number>();

  for (const row of data) {
    const value = row[columnId];
    const strValue = value !== undefined && value !== null ? String(value).trim() : '';
    valueCountMap.set(strValue, (valueCountMap.get(strValue) || 0) + 1);
  }

  // Değerleri frekansa göre sırala (en çok kullanılan önce)
  const sortedValues = Array.from(valueCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);

  return {
    uniqueValues: sortedValues,
    totalCount: valueCountMap.size
  };
}
