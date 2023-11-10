import { Component, Input, OnInit } from '@angular/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ExtensionGridActionsRendererComponent } from '@shared/components/extension/extension-grid/extension-grid-actions-renderer/extension-grid-actions-renderer.component';
import { ExtensionGridStatusRendererComponent } from '@shared/components/extension/extension-grid/extension-grid-status-renderer/extension-grid-status-renderer.component';
import { ValueFormatterParams } from '@ag-grid-community/core/dist/cjs/es5/entities/colDef';
import { ExtensionGridIdRendererComponent } from '@shared/components/extension/extension-grid/extension-grid-id-renderer/extension-grid-id-renderer.component';
import { DatePipe } from '@angular/common';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';

@Component({
  selector: 'app-extension-grid',
  templateUrl: './extension-grid.component.html',
  styleUrls: ['./extension-grid.component.scss'],
})
export class ExtensionGridComponent implements OnInit {
  @Input() public data: any = [];
  @Input() public system: any = [];
  
  public OrderManagementIRPSystem = OrderManagementIRPSystemId;

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

  public readonly columnDefinitionsforIRP: ColumnDefinitionModel[] = [
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
  activeSystems: OrderManagementIRPSystemId | null;

  public constructor(private datePipe: DatePipe,
                      private orderManagementService : OrderManagementService) {}

  ngOnInit(): void {
    this.activeSystems = this.orderManagementService.getOrderManagementSystem();
  }

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format, 'UTC') ?? '';
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yyyy');
  }
}
