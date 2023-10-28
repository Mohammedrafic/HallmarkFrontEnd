import { ColDef, FilterChangedEvent, GridOptions } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GlobalWindow } from '@core/tokens';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { OPTION_FIELDS } from '@shared/components/associate-list/constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ExportColumn } from '@shared/models/export.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { AppState } from 'src/app/store/app.state';
import { ExpandEventArgs } from '@syncfusion/ej2-angular-navigations';
import { AgencyAuditHistoryTableColumnsDefinition, EmptyAgency } from './agency-history-details.constants';
import { Agency, AgencyAuditHistory } from '../../../shared/models/agency.model';
import { GetAgencyAuditHistory, GetAgencyAuditHistoryDetailSucceeded } from '../../store/agency.actions';
import { AgencyState } from '../../store/agency.state';

@Component({
  selector: 'app-agency-history-details',
  templateUrl: './agency-history-details.component.html',
  styleUrls: ['./agency-history-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgencyHistoryDetailsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @Input() agencyHD: Subject<Agency>;
  private unsubscribe$: Subject<void> = new Subject();
  public gridApi: any;
  private isAlive: boolean = true;
  viewedTab: number[] = [];
  @Select(AgencyState.getAgencyAuditHistoryDetails)
  agencyHistoryDetails$: Observable<AgencyAuditHistory[]>;

  @Select(AppState.getMainContentElement)
  public readonly targetElement$: Observable<HTMLElement | null>;
  public targetElement: HTMLElement = document.body;
  public optionFields = OPTION_FIELDS;
  public agencyDetail: any;
  agencyAuditHistoryDetails: Array<AgencyAuditHistory> = [];
  public columnsToExport: ExportColumn[];
  sideBar = SideBarConfig;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  public readonly agencyColumnDefinitions: ColumnDefinitionModel[] = AgencyAuditHistoryTableColumnsDefinition();

  defaultColDef: ColDef = DefaultUserGridColDef;

  constructor(
    private actions$: Actions,
    private datePipe: DatePipe,
    protected override store: Store,
    private _detector: ChangeDetectorRef,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super(store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.onOpenEvent();
  }

  private onOpenEvent(): void {
    this.agencyHD.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.agencyDetails.id! > 0) {
        this.gridApi?.setRowData([]);
        this.agencyDetail = data;
        this.sideDialog.refresh();
        this.sideDialog.show();
      }
      else {
        this.gridApi.setRowData([]);
        this.sideDialog.hide();
      }
      this._detector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sideDialog.hide();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onClose(): void {
    this.viewedTab = [];
    this.gridApi?.setRowData([]);
    this.agencyAuditHistoryDetails = [];
    this.sideDialog.hide();
    this.agencyHD.next(EmptyAgency);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.agencyAuditHistoryDetails);
  }

  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.agencyColumnDefinitions,
    rowData: this.agencyAuditHistoryDetails,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    }
  };

  public expanding(e: ExpandEventArgs) {
    const expandData: ExpandEventArgs = e;
    switch (e.index) {
      case 0:
        if (e.isExpanded && this.agencyDetail?.agencyDetails.id > 0) {
          if (!this.viewedTab.some(a => a == e.index)) {
            this.store.dispatch(new GetAgencyAuditHistory({ entityTypeName: "Einstein.CoreApplication.Domain.Entities.BusinessUnit", searchValue: this.agencyDetail.agencyDetails.id.toString() }));
            this.actions$.pipe(ofActionDispatched(GetAgencyAuditHistoryDetailSucceeded), take(1))
              .subscribe(() => {
                this.viewedTab.push(expandData?.index!);
                this.agencyHistoryDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((agency) => {
                  this.agencyAuditHistoryDetails = agency;
                  this.gridApi?.setRowData(this.agencyAuditHistoryDetails);
                });
              });
          } else {
            this.agencyHistoryDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((agency) => {
              this.agencyAuditHistoryDetails = agency;
              this.gridApi?.setRowData(this.agencyAuditHistoryDetails);
            });
          }
        }
        break;
    }
  }
}
