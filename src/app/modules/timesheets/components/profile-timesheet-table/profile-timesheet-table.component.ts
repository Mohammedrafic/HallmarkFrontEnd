import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { combineLatest, Observable, takeUntil } from 'rxjs';
import { filter, skip, switchMap, take, tap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { GridApi, GridReadyEvent, IClientSideRowModel, Module } from '@ag-grid-community/core';
import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { DropdownOption } from '@core/interface';
import { RecordFields, RecordsMode, SubmitBtnText, TIMETHEETS_STATUSES } from '../../enums';
import { RecordsTabConfig, TimesheetConfirmMessages, TimesheetRecordsColConfig, TimesheetRecordsColdef } from '../../constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { DialogActionPayload, OpenAddDialogMeta, TabConfig, TimesheetDetailsModel, TimesheetRecordsDto } from '../../interface';
import { TimesheetRecordsService } from '../../services';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { RecordsAdapter } from '../../helpers';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { DropdownEditorComponent } from '../cell-editors/dropdown-editor/dropdown-editor.component';

/**
 * TODO: move tabs into separate component if possible
 */
@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTimesheetTableComponent extends Destroyable implements AfterViewInit, OnChanges {
  @ViewChild('tabs') readonly tabs: TabComponent;

  @ViewChild('grid') readonly grid: IClientSideRowModel;

  @ViewChild('spinner') readonly spinner: ElementRef;

  @Input() timesheetDetails: TimesheetDetailsModel;

  @Input() isAgency: boolean;

  @Input() actionsDisabled: boolean = false;

  @Output() readonly openAddSideDialog: EventEmitter<OpenAddDialogMeta> = new EventEmitter<OpenAddDialogMeta>();

  @Output() readonly changesSaved: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() readonly rejectEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() readonly approveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Select(TimesheetsState.tmesheetRecords)
  public readonly timesheetRecords$: Observable<TimesheetRecordsDto>;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<DialogActionPayload>;

  @Select(TimesheetsState.billRateTypes)
  private readonly billRates$: Observable<DropdownOption[]>;

  @Select(TimesheetsState.costCenters)
  private readonly costCenters$: Observable<DropdownOption[]>;

  public isEditOn = false;

  public timesheetColDef = TimesheetRecordsColdef;

  public readonly modules: Module[] = [ClientSideRowModelModule];

  public readonly tabsConfig: TabConfig[] = RecordsTabConfig;

  public currentTab: RecordFields = RecordFields.Time;

  public readonly tableTypes = RecordFields;

  public isFirstSelected = true;

  public readonly modeValues = RecordsMode;

  public recordsToShow: TimesheetRecordsDto;

  public currentMode: RecordsMode = RecordsMode.View;

  public context: { componentParent: ProfileTimesheetTableComponent };

  public loading = false;

  public isEditEnabled = false;

  public isApproveBtnEnabled = false;

  public isRejectBtnEnabled = false;

  public actionButtonDisabled = false;

  public submitText: string;

  private records: TimesheetRecordsDto;

  private isChangesSaved = true;

  private formControls: Record<string, FormGroup> = {};

  private gridApi: GridApi;

  private slectingindex: number;

  private idsToDelete: number[] = [];

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private timesheetRecordsService: TimesheetRecordsService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.context = {
      componentParent: this,
    };
    this.submitText = this.isAgency ? SubmitBtnText.Submit : SubmitBtnText.Approve;
  }

  ngOnChanges(): void {
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }

    if (this.timesheetDetails) {
      this.initBtnsState();
      this.setActionBtnState();
      this.initEditBtnsState();
      this.cd.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.getRecords();
    this.watchForDialogState();
  }

  public onTabSelect(selectEvent: SelectingEventArgs): void {
    this.isFirstSelected = false;

    if (!this.isChangesSaved && (this.slectingindex !== selectEvent.selectedIndex)) {
      this.confirmService.confirm(TimesheetConfirmMessages.confirmTabChange, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        take(1),
      )
      .subscribe((submitted) => {
        if (submitted) {
          this.isChangesSaved = true;
          this.setInitialTableState();
          this.selectTab(selectEvent.selectedIndex);
        } else {
          this.slectingindex = selectEvent.previousIndex;
          this.tabs.select(selectEvent.previousIndex);
        }
      });
    } else {
      if (this.isChangesSaved) {
        this.setInitialTableState();
      }
      this.selectTab(selectEvent.selectedIndex);
    }
    this.initBtnsState();
    this.initEditBtnsState();
    this.cd.detectChanges();
  }

  public openAddDialog(): void {
    const startDate = this.store.snapshot().timesheets.selectedTimeSheet.startDate;

    this.openAddSideDialog.emit({
      currentTab: this.currentTab,
      initDate: startDate,
    });
  }

  public editTimesheets(): void {
    this.isEditOn = true;
    this.currentMode = RecordsMode.Edit;
    this.recordsToShow = JSON.parse(JSON.stringify(this.records));
    this.gridApi.setRowData(this.recordsToShow[this.currentTab][this.currentMode]);
    this.createForm();
    this.setEditModeColDef();
  }

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
  }

  public cancelChanges(): void {
    this.changesSaved.emit(true);
    this.loading = false;
    this.isChangesSaved = true;
    this.recordsToShow = JSON.parse(JSON.stringify(this.records));
    this.idsToDelete = [];
    this.setInitialTableState();
  }

  public saveChanges(): void {
    const diffs = this.timesheetRecordsService.findDiffs(
      this.records[this.currentTab][this,this.currentMode], this.formControls, this.timesheetColDef);

    const recordsToUpdate = RecordsAdapter.adaptRecordsDiffs(
      this.records[this.currentTab][this,this.currentMode], diffs, this.idsToDelete);

    if (diffs.length || this.idsToDelete.length) {
      this.loading = true;
      this.cd.detectChanges();
      createSpinner({
        target: this.spinner.nativeElement,
      });
      showSpinner(this.spinner.nativeElement);

      const { organizationId, id } = this.store.snapshot().timesheets.selectedTimeSheet;
      const dto = RecordsAdapter.adaptRecordPutDto(
        recordsToUpdate, organizationId, id, this.currentTab, this.idsToDelete);

      this.store.dispatch(new TimesheetDetails.PutTimesheetRecords(dto, this.isAgency))
      .pipe(
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.loading = false;
        this.changesSaved.emit(true);
        this.isChangesSaved = true;
        this.idsToDelete = [];
        this.setInitialTableState();
        this.cd.detectChanges();
      });
    }
  }

  public trackByIndex(index: number, item: TabConfig): number {
    return index;
  }

  public deleteRecord(id: number): void {
    this.confirmService.confirm(TimesheetConfirmMessages.confirmRecordDelete, {
      title: 'Delete Record',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    )
    .subscribe(() => {
      this.idsToDelete.push(id);
      this.recordsToShow[this.currentTab][this.currentMode] = this.recordsToShow[this.currentTab][this.currentMode]
      .filter((record) => record.id !== id);
      this.cd.markForCheck();
    });
  }

  public onRejectButtonClick(): void {
    this.rejectEvent.emit(this.currentTab === RecordFields.Time);
  }

  public handleApprove(): void {
    this.approveEvent.emit(this.currentTab === RecordFields.Time);
  }

  private selectTab(index: number): void {
    this.changeColDefs(index);
  }

  private createForm(): void {
    this.formControls = this.timesheetRecordsService.createEditForm(
      this.records, this.currentTab, this.timesheetColDef);
    this.watchFormChanges();
  }

  private getRecords(): void {
    this.timesheetRecords$
    .pipe(
      tap((res) => {
        if (this.isEditOn) {
          this.isEditOn = false;
          this.currentMode = RecordsMode.View;
          this.cancelChanges();
        }
        this.records = res;
        this.recordsToShow = JSON.parse(JSON.stringify(res));
      }),
      switchMap(() => {
        return combineLatest([
          this.billRates$,
          this.costCenters$,
        ]);
      }),
      filter(() => !!this.gridApi),
      tap((data) => {
        this.timesheetRecordsService.controlTabsVisibility(data[0], this.tabs);
        this.gridApi.hideOverlay();
       }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      if (!this.records[this.currentTab][this.currentMode].length) {
        this.gridApi.showNoRowsOverlay();
      }
      this.setEditModeColDef();
      this.gridApi.setColumnDefs(this.timesheetColDef);
      this.cd.markForCheck();
    });
  }

  private setInitialTableState(): void {
    this.isEditOn = false;
    this.currentMode = RecordsMode.View;
    this.formControls = {};
    this.setEditModeColDef();
    this.cd.markForCheck();
  }

  private setEditModeColDef(): void {
    this.timesheetColDef = this.timesheetColDef.map((def) => {
      if (this.isEditOn && def.field === 'billRateConfigName'
      && this.currentTab === RecordFields.Time) {
        const editData = {
          cellRenderer: DropdownEditorComponent,
          cellRendererParams: {
            editMode: true,
            isEditable: true,
            options: [],
            storeField: 'billRateTypes',
          }
        }
        def.field = 'billRateConfigId';
        def = {
          ...def,
          ...editData,
        };
      } else if (!this.isEditOn && def.field === 'billRateConfigId' && this.currentTab === RecordFields.Time) {
        def.field = 'billRateConfigName';
        delete def.cellRenderer;
        delete def.cellRendererParams;
      }

      if ((def.field === 'billRate' || def.field === 'total') && this.currentTab !== RecordFields.Expenses) {
        def.hide = this.isEditOn;
      }

      if (def.cellRendererParams && def.cellRendererParams.editMode) {
        def.cellRendererParams.isEditable = this.isEditOn;
        def.cellRendererParams.formGroup = this.formControls;
      }

      return def;
    });
    this.gridApi.setColumnDefs(this.timesheetColDef);
  }

  private changeColDefs(idx: number): void {
    this.currentTab = this.timesheetRecordsService.getCurrentTabName(idx);
    this.timesheetColDef = TimesheetRecordsColConfig[this.currentTab];
    this.cd.markForCheck();
  }

  private watchForDialogState(): void {
    this.isTimesheetOpen$
    .pipe(
      skip(1),
      filter((payload) => !payload),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.cancelChanges();
    })
  }

  private watchFormChanges(): void {
    this.timesheetRecordsService.watchFormChanges(this.formControls)
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      if (this.timesheetRecordsService.checkIfFormTouched(this.formControls)) {
        this.isChangesSaved = false;
        this.changesSaved.emit(false);
      }
    })
  }

  private initBtnsState(): void {
    const currentTabMapping: Map<RecordFields, boolean> = new Map<RecordFields, boolean>()
      .set(RecordFields.Time, this.timesheetDetails.canApproveTimesheet)
      .set(RecordFields.Miles, this.timesheetDetails.canApproveMileage);

    this.isApproveBtnEnabled = !!currentTabMapping.get(this.currentTab);
    this.isRejectBtnEnabled = !this.isAgency && !!currentTabMapping.get(this.currentTab);
  }

  private setActionBtnState(): void {
    if (this.isAgency) {
      this.actionButtonDisabled =
        this.timesheetDetails.statusText === TIMETHEETS_STATUSES.PENDING_APPROVE
        || this.timesheetDetails.statusText === TIMETHEETS_STATUSES.APPROVED;
    } else {
      this.actionButtonDisabled =
        this.timesheetDetails.statusText === TIMETHEETS_STATUSES.APPROVED;
    }
  }

  private initEditBtnsState(): void {
    const currentTabMapping: Map<RecordFields, boolean> = new Map<RecordFields, boolean>()
      .set(RecordFields.Time, this.timesheetDetails.canEditTimesheet)
      .set(RecordFields.Miles, this.timesheetDetails.canEditMileage);

    this.isEditEnabled = !!currentTabMapping.get(this.currentTab);
  }
}
