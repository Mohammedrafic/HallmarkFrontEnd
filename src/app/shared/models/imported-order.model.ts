import { Order } from '@shared/models/order-management.model';
import { ColDef } from '@ag-grid-community/core';

export type ExtendedOrder = Order
  & {jobTitle: string,
  tempOrderId: string,
  errorProperties: string[],
  agency: string,
  classification: string,
  jobDistribution: string,
  department: string,
  location: string
};


export type OrderImportResult = {
  succesfullRecords: ImportedOrder[];
  errorRecords: ImportedOrder[];
}

export interface ImportedOrder {
  tempOrderId: string;
  orderImport: ExtendedOrder;
  orderImportJobDistributions: ExtendedOrder[];
  orderImportClassifications: ExtendedOrder[];
}

export interface ListBoxItem {
  name: string;
  id: string;
}

export interface OrderGrid {
  columnDefs: ColDef[];
  rowData: Order[]
  gridName?: string;
}

export interface ImportedOrderGrid {
  tempOrderId: string;
  grids: OrderGrid[]
}
