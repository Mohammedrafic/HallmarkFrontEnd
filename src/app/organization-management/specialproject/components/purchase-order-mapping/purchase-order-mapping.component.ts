import { Component, OnDestroy, OnInit, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { PurchaseOrderMapping, PurchaseOrderMappingPage } from "@shared/models/purchase-order-mapping.model";
import {
  GridApi,
  GridReadyEvent,
  GridOptions
} from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { PurchaseOrderMappingColumnsDefinition } from '../../constants/specialprojects.constant';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { FormGroup } from '@angular/forms';
import { PurchaseOrderMappingState } from '../../../store/purchase-order-mapping.state';
import { DeletePurchaseOrderMapping, GetPurchaseOrderMappings } from '../../../store/purchase-order-mapping.actions';

@Component({
  selector: 'app-purchase-order-mapping',
  templateUrl: './purchase-order-mapping.component.html',
  styleUrls: ['./purchase-order-mapping.component.scss']
})
export class PurchaseOrderMappingComponent extends AbstractGridConfigurationComponent implements OnInit {

  @Input() form: FormGroup;
  @Output() onEdit = new EventEmitter<PurchaseOrderMapping>();
  @Select(PurchaseOrderMappingState.purchaseOrderMappingPage)
  purchaseOrderMappingPage$: Observable<PurchaseOrderMappingPage>;
  private unsubscribe$: Subject<void> = new Subject();
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public gridApi!: GridApi;
  public rowData: PurchaseOrderMapping[] = [];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    handleOnEdit: (params: PurchaseOrderMapping) => {
      this.onEdit.next(params);
    },
    handleOnDelete: (params: any) => {
      this.deletePurchaseOrderMapping(params);
    }
  }

  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }

  public readonly columnDefinitions: ColumnDefinitionModel[] = PurchaseOrderMappingColumnsDefinition(this.actionCellrenderParams);

  ngOnInit(): void {
    this.getPurchaseOrderMappings();
  }

  onPageSizeChanged(event: any) {
    this.gridOptions.cacheBlockSize = Number(event.value.toLowerCase().replace("rows", ""));
    this.gridOptions.paginationPageSize = Number(event.value.toLowerCase().replace("rows", ""));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.rowData);
    }
  }

  public sideBar = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filters',
        toolPanel: 'agFiltersToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
    ],
  };

  gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefinitions,
    rowData: this.rowData,
    sideBar: this.sideBar
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }

  public getPurchaseOrderMappings(): void {
    this.store.dispatch(new GetPurchaseOrderMappings({getAll:true}));
    this.purchaseOrderMappingPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.items) {
        this.rowData = data.items;
        this.gridApi.setRowData(this.rowData);
      }
    });
  }

  deletePurchaseOrderMapping(params: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && params.id) {
          this.store.dispatch(new DeletePurchaseOrderMapping(params.id)).subscribe(val => {
            this.getPurchaseOrderMappings();
          });
        }
        this.removeActiveCssClass();
      });
  }
}
