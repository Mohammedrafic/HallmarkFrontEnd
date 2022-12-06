import { Injectable } from '@angular/core';
import { columnDefs } from '@client/order-management/order-import/order-import.config';
import { GridErroredCellComponent } from '@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component';
import { ImportedOrder, ImportedOrderGrid, ListBoxItem, OrderGrid, OrderImportResult } from '@shared/models/imported-order.model';
import { ColDef } from '@ag-grid-community/core';
import { Order } from '@shared/models/order-management.model';
import { Observable } from 'rxjs';
import { CandidateImportResult } from '@shared/models/candidate-profile-import.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class OrderImportService {

  constructor(private http: HttpClient) { }

  public getImportOrderTemplate(): Observable<any> {
    return this.http.post('/api/Orders/template', [],{ responseType: 'blob' });
  }

  public getImportOrderErrors(errorRecords: ImportedOrder[]): Observable<any> {
    return this.http.post('/api/Orders/template', errorRecords, { responseType: 'blob' });
  }

  public uploadImportOrderFile(file: Blob): Observable<OrderImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OrderImportResult>('/api/Orders/import', formData);
  }

  public saveImportOrderResult(successfullRecords: ImportedOrder[]): Observable<CandidateImportResult> {
    return this.http.post<CandidateImportResult>('/api/Orders/saveimport', successfullRecords);
  }

  public buildOrderGrids(importedOrders: ImportedOrder[]): ImportedOrderGrid[] {
    return importedOrders.map((importedOrder: ImportedOrder) => {
      return {
        tempOrderId: importedOrder.tempOrderId,
        grids: [
          {
            gridName: 'General Info',
            ...this.createGrid(columnDefs.generalInfoTop, importedOrder.orderImport),
          },
          this.createGrid(columnDefs.generalInfoMiddle, importedOrder.orderImport),
          this.createGrid(columnDefs.generalInfoBottom, importedOrder.orderImport),
          {
            gridName: 'Job Distribution & Description',
            ...this.createGrid(columnDefs.jobDistribution, this.margeProperties(importedOrder)),
          },
          this.createGrid(columnDefs.jobDescription, importedOrder.orderImport),
          {
            gridName: 'Contact Details',
            ...this.createGrid(columnDefs.contactDetails, importedOrder.orderImport),
          },
          {
            gridName: 'Work Location',
            ...this.createGrid(columnDefs.workLocation, importedOrder.orderImport),
          },
          {
            gridName: 'Special Project',
            ...this.createGrid(columnDefs.specialProject, importedOrder.orderImport),
          },
        ],
      };
    });
  }

  public getListBoxData(records: ImportedOrder[]): ListBoxItem[] {
    return records.map((record: ImportedOrder) => {
      return {
        name: record.orderImport.jobTitle || record.orderImport.tempOrderId,
        id: record.orderImport.tempOrderId,
      };
    });
  }

  private margeProperties(importedOrder: ImportedOrder): any {
    const { orderImportClassifications } = importedOrder;
    const { orderImportJobDistributions } = importedOrder;
    const { orderImport } = importedOrder;

    const classification = orderImportClassifications
      .filter((({ tempOrderId }) => tempOrderId === importedOrder.orderImport.tempOrderId))
      .map(({classification}) => classification)
      .join(', ');
    const jobDistribution = orderImportJobDistributions
      .filter((({ tempOrderId }) => tempOrderId === importedOrder.orderImport.tempOrderId))
      .map(({jobDistribution}) => jobDistribution)
      .join(', ');
    const agency = orderImportJobDistributions
      .filter((({ tempOrderId }) => tempOrderId === importedOrder.orderImport.tempOrderId))
      .map(({agency}) => agency)
      .join(', ');

    return {
      ...orderImport,
      classification,
      jobDistribution,
      agency,
    };
  }

  private createColumnDef(gridConfig: { [key: string]: string }): ColDef[] {
    const columnWidth = 200;

    return Object.entries(gridConfig).map(([key, value]: [string, string]) => {
      return {
        field: key,
        width: columnWidth,
        headerName: value,
        cellRenderer: GridErroredCellComponent,
      };
    });
  }

  private createGrid(config: { [key: string]: string }, source: Order): OrderGrid {
    return {
      columnDefs: this.createColumnDef(config),
      rowData: [source],
    };
  }
}
