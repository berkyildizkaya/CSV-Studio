/// <reference types="vite/client" />

import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEditRow?: (index: number, data: TData) => void;
    onInsertRow?: (index: number) => void;
    onDeleteRow?: (index: number) => void;
  }
}