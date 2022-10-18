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

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DropdownOption } from '@core/interface';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { RecordFields, RecordsMode, SubmitBtnText, TIMETHEETS_STATUSES, RecordStatus } from '../../enums';
import { RecordsTabConfig, TimesheetConfirmMessages, TimesheetRecordsColdef } from '../../constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import {
  Attachment,
  DialogActionPayload,
  OpenAddDialogMeta,
  TabConfig,
  TimesheetAttachments,
  TimesheetDetailsModel,
  TimesheetRecordsDto
} from '../../interface';
import { TimesheetDetailsTableService, TimesheetRecordsService } from '../../services';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { RecordsAdapter } from '../../helpers';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

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

  @Input() disableAnyAction: boolean = false;

  @Output() readonly openAddSideDialog: EventEmitter<OpenAddDialogMeta> = new EventEmitter<OpenAddDialogMeta>();

  @Output() readonly uploadSideDialog: EventEmitter<TimesheetAttachments> = new EventEmitter<TimesheetAttachments>();

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

  public readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;

  public timesheetColDef = TimesheetRecordsColdef(false);

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

  public readonly getRowStyle = (params: any) => {
    if (params.data.stateText === RecordStatus.New) {
      return { 'background-color': '#F2FAF2'}
    }
    if (params.data.stateText === RecordStatus.Deleted) {
      return { 'background-color': '#FFDFDF'}
    }
    return { 'background-color': 'inherit'}
  }

  private records: TimesheetRecordsDto;

  private isChangesSaved = true;

  private formControls: Record<string, FormGroup> = {};

  private gridApi: GridApi;

  private slectingindex: number;

  private idsToDelete: number[] = [];

  private isStatusColAvaliable = false;

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private timesheetRecordsService: TimesheetRecordsService,
    private timesheetDetailsTableService: TimesheetDetailsTableService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.context = {
      componentParent: this,
    };
  }

  ngOnChanges(): void {
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }

    if (this.timesheetDetails) {
      this.submitText = this.isAgency ? SubmitBtnText.Submit : SubmitBtnText.Approve;

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
    const { weekStartDate, weekEndDate, jobEndDate, jobStartDate } = this.store.snapshot().timesheets.timesheetDetails;
    const startDate = DateTimeHelper.getFirstDayOfWeekUtc(jobStartDate) > DateTimeHelper.getFirstDayOfWeekUtc(weekStartDate)
      ? jobStartDate : weekStartDate;
    const endDate = DateTimeHelper.getFirstDayOfWeekUtc(jobEndDate) < DateTimeHelper.getFirstDayOfWeekUtc(weekEndDate)
      ? jobEndDate : weekEndDate;

    this.openAddSideDialog.emit({
      currentTab: this.currentTab,
      startDate,
      endDate,
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
    if (this.checkTabStatusApproved()) {
      this.confirmService.confirm(TimesheetConfirmMessages.confirmEdit, {
        title: 'Edit Timesheet',
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.saveRecords();
      })
    } else {
      this.saveRecords();
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

  public uploadAttachments(id: number, attachments: Attachment[]): void {
    this.uploadSideDialog.emit({ id, attachments });
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
    this.checkForStatusCol();
    this.timesheetColDef = this.timesheetRecordsService.createEditColDef(this.isEditOn,
      this.currentTab, this.formControls, this.timesheetColDef);

    this.gridApi.setColumnDefs(this.timesheetColDef);
  }

  private changeColDefs(idx: number): void {
    const { organizationId } = this.store.snapshot().timesheets.timesheetDetails;
    this.currentTab = this.timesheetRecordsService.getCurrentTabName(idx);
    this.checkForStatusCol();
    this.timesheetColDef = this.timesheetDetailsTableService.getTableRecordsConfig()[this.currentTab](
      this.isStatusColAvaliable,
      organizationId,
      this.disableAnyAction
    );
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

    if (this.isAgency) {
      this.isApproveBtnEnabled = !!currentTabMapping.get(this.currentTab);
    }
  }

  private checkForStatusCol(): void {
    const { organizationId } = this.store.snapshot().timesheets.timesheetDetails;
    this.isStatusColAvaliable =  this.timesheetRecordsService
    .checkForStatus(this.recordsToShow[this.currentTab][this.currentMode]);

    if (this.isEditOn) {
      this.isStatusColAvaliable = false;
    }

    this.timesheetColDef = this.timesheetDetailsTableService.getTableRecordsConfig()[this.currentTab](
      this.isStatusColAvaliable,
      organizationId,
      this.disableAnyAction
    );
  }

  private saveRecords(): void {
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

      const { organizationId, id, mileageTimesheetId } = this.store.snapshot().timesheets.timesheetDetails;
      const dto = RecordsAdapter.adaptRecordPutDto(
        recordsToUpdate,
        organizationId,
        this.currentTab === RecordFields.Time ? id : mileageTimesheetId,
        this.currentTab,
        this.idsToDelete,
      );

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

  private checkTabStatusApproved(): boolean {
    return (this.currentTab === RecordFields.Time && this.timesheetDetails.status === TimesheetStatus.Approved);
  }
}
