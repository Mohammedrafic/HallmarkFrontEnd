import { Component, Input } from '@angular/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ExtensionGridActionsRendererComponent } from '@shared/components/extension/extension-grid/extension-grid-actions-renderer/extension-grid-actions-renderer.component';
import { ExtensionGridStatusRendererComponent } from '@shared/components/extension/extension-grid/extension-grid-status-renderer/extension-grid-status-renderer.component';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { ExtensionGridIdRendererComponent } from '@shared/components/extension/extension-grid/extension-grid-id-renderer/extension-grid-id-renderer.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-extension-grid',
  templateUrl: './extension-grid.component.html',
  styleUrls: ['./extension-grid.component.scss'],
})
export class ExtensionGridComponent {
  @Input() public data: any = [];

  public readonly columnDefinitions: ColumnDefinitionModel[] = [
    {
      headerName: 'Extension ID',
      cellRenderer: ExtensionGridIdRendererComponent,
      maxWidth: 140,
      valueGetter: (params) => `${params.data.organizationPrefix}-${params.data.publicId}`,
    },
    {
      field: 'statusText',
      headerName: 'Status',
      cellRenderer: ExtensionGridStatusRendererComponent,
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'billRate',
      headerName: 'Bill Rate $',
      valueFormatter: (params: ValueFormatterParams) => `$${params.data.billRate}`,
      maxWidth: 130,
    },
    {
      field: 'actualStartDate',
      headerName: 'Extension Start Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      maxWidth: 150,
    },
    {
      field: 'actualEndDate',
      headerName: 'Extension End Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      maxWidth: 150,
    },
    {
      field: '',
      headerName: '',
      cellRenderer: ExtensionGridActionsRendererComponent,
      maxWidth: 80,
      cellClass: 'extension-buttons',
    },
  ];

  public constructor(private datePipe: DatePipe) {}

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format) ?? '';
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yyyy');
  }
}
