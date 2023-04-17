import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TakeUntilDestroy } from '@core/decorators';
import { DateTimeHelper } from '@core/helpers';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { OrientationTab } from '@organization-management/orientation/enums/orientation-type.enum';
import { OrientationConfiguration, OrientationConfigurationFilters, OrientationConfigurationPage } from '@organization-management/orientation/models/orientation.model';
import { OrientationService } from '@organization-management/orientation/services/orientation.service';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, SETUPS_ACTIVATED } from '@shared/constants';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { MessageTypes } from '@shared/enums/message-types';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { SkillCategoriesPage } from '@shared/models/skill-category.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ShowExportDialog, ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { MasterOrientationExportCols } from '../orientation-grid/orientation-grid.constants';
import { GridApi, RowNode } from '@ag-grid-community/core';
import { ExportOrientation } from './orientation.action';

@Component({
  selector: 'app-orientation-historical-data',
  templateUrl: './orientation-historical-data.component.html',
  styleUrls: ['./orientation-historical-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class OrientationHistoricalDataComponent extends AbstractPermissionGrid implements OnInit {
  @Input() public isActive: boolean;
  @ViewChild('grid')
  public grid: GridComponent;
  public regions: OrganizationRegion[] = [];
  public readonly orientationTab = OrientationTab;
  public dataSource: OrientationConfigurationPage;
  public filters: OrientationConfigurationFilters = { pageNumber: 1, pageSize: this.pageSize };
  public disableControls: boolean = false;
  public orientationForm: FormGroup = this.orientationService.generateHistoricalDataForm();
  public bulkActionConfig: BulkActionConfig = { activate: true };
  public fileName: string;
  public defaultFileName: string;
  public columnsToExport: ExportColumn[] = MasterOrientationExportCols;
  private gridApi: GridApi;
  public selectedRowDatas : any[]=[]
  @Input() export$: Subject<ExportedFileType>;
  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;
  private unsubscribe$: Subject<void> = new Subject();
  protected componentDestroy: () => Observable<unknown>;

  @Select(UserState.organizationStructure)
  public readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.allSkillsCategories)
  public readonly allSkillsCategories$: Observable<SkillCategoriesPage | null>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public readonly skills$: Observable<Skill[]>;
  
  constructor(
    protected override store: Store,
    private cd: ChangeDetectorRef,
    private orientationService: OrientationService,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private actions$: Actions,
  ) {
    super(store);
    this.watchForOrgChange();
    this.watchForSettingState();
    this.watchForExportDialog();
    this.watchForOrgStructure();
  }

  override ngOnInit(): void {
    this.watchForDefaultExport();
  }
  private watchForSettingState(): void {
    this.orientationService.checkIfSettingOff()
      .pipe(
        takeUntil(this.componentDestroy()),
      )
      .subscribe(val => {
        this.disableControls = val;
        this.cd.markForCheck();
      })
  }

  private watchForOrgChange(): void {
    this.organizationId$
      .pipe(
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.getOrientationHistoricalData();
      });
  }

  private getOrientationHistoricalData(): void {
    this.orientationService.getHistoricalOrientationConfigs(this.filters).subscribe(data => {
      this.dataSource = data;
      this.cd.markForCheck();
    });
  }

  private watchForOrgStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: OrganizationStructure) => {
        this.regions = structure.regions;
      });
  }

  private populateForm(data: number[]): void {
    this.orientationForm.patchValue({
      ids: data,
      endDate: null,
    });
    this.cd.markForCheck();
  }

  private closeHandler(): void {
    this.orientationForm.reset();
    this.store.dispatch(new ShowSideDialog(false));
  }

  public closeDialog(): void {
    if (this.orientationForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm: boolean) => !!confirm))
        .subscribe(() => {
          this.closeHandler();
        });
    } else {
      this.closeHandler();
    }
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
       this.store.dispatch(new ExportOrientation(new ExportPayload(
      fileType,
      { ...this.filters, offset: Math.abs(new Date().getTimezoneOffset()) ,
        ids: this.selectedRowDatas.length ? this.selectedRowDatas.map((val) => val[this.idFieldName]) : null, },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column)
      ,null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }
  public handleExport(event: RowNode[]): void {
    const nodes = event;
    this.selectedRowDatas=[]
    if (nodes.length) {
      nodes.forEach(element => {
        this.selectedRowDatas.push(element.data);
      });
    } 
  }
  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  private watchForDefaultExport(): void {
    this.export$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Historical Data' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }
  
 
  private watchForExportDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowExportDialog),
      filter((value) => value.isDialogShown),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.defaultFileName = 'Historical Data' + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
    });
  }


  public saveRecord(): void {
    if (this.orientationForm.invalid) {
      this.orientationForm.markAllAsTouched();
    } else {
      const data = this.orientationForm.getRawValue();
      data.endDate = data.endDate ? DateTimeHelper.toUtcFormat(data.endDate) : data.endDate;
      this.orientationService.reactivateOrientationConfiguration(data).subscribe({
        next: () => {
          this.store.dispatch(new ShowToast(MessageTypes.Success, SETUPS_ACTIVATED));
          this.closeHandler();
          this.getOrientationHistoricalData();
        },
        error: (error) => this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)))
      });
    }
  }

  public pageChange(data: OrientationConfigurationFilters): void {
    this.filters = data;
    this.getOrientationHistoricalData();
  }

  public openDialog(event: {
    isBulk: boolean
    data: OrientationConfiguration | BulkActionDataModel
  }): void {
    if (!event.isBulk) {
      this.populateForm([(event.data as OrientationConfiguration).id]);    
    } else {
      const ids = (event.data as BulkActionDataModel).items.map(item => item.data.id);
      this.populateForm(ids);
    }
    this.store.dispatch(new ShowSideDialog(true));
  }
}
