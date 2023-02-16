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
      field: '',
      headerName: '',
      cellRenderer: ExtensionGridActionsRendererComponent,
      maxWidth: 80,
      cellClass: 'extension-buttons',
    },
    {
      headerName: 'Extension ID',
      cellRenderer: ExtensionGridIdRendererComponent,
      width: 140,
      minWidth: 135,
      headerClass: 'custom-wrap',
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
      type: 'rightAligned',
      valueFormatter: (params: ValueFormatterParams) => `$${params.data.billRate}`,
      width: 130,
      minWidth: 95,
      headerClass: 'custom-wrap align-right',
    },
    {
      field: 'actualStartDate',
      headerName: 'Extension Start Date',
      type: 'rightAligned',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      width: 180,
      minWidth: 130,
      headerClass: 'custom-wrap align-right',
    },
    {
      field: 'actualEndDate',
      headerName: 'Extension End Date',
      type: 'rightAligned',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      width: 180,
      minWidth: 130,
      headerClass: 'custom-wrap align-right',
    },
  ];

  public constructor(private datePipe: DatePipe) {}

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format, 'UTC') ?? '';
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yyyy');
  }
}
