import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { debounceTime, filter, skip, switchMap, take, tap, throttleTime, map } from 'rxjs/operators';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { ComponentStateChangedEvent, GridApi, GridReadyEvent, IClientSideRowModel, Module } from '@ag-grid-community/core';
import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { RecordFields, RecordsMode, SubmitBtnText, TIMETHEETS_STATUSES, RecordStatus } from '../../enums';
import {
  RecordRosStatusClass,
  TableTitleMapper,
  TimesheetConfirmMessages,
  TimesheetRecordsColdef
} from '../../constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import {
  Attachment,
  DialogActionPayload,
  OpenAddDialogMeta,
  TimesheetAttachments,
  TimesheetDetailsModel,
  TimesheetRecordsDto,
} from '../../interface';
import { TimesheetDetailsTableService, TimesheetRecordsService } from '../../services';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { RecordsAdapter } from '../../helpers';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BreakpointQuery } from '@shared/enums/media-query-breakpoint.enum';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { MobileMenuItems } from '@shared/enums/mobile-menu-items.enum';
import { MiddleTabletWidth, SmallTabletWidth } from '@shared/constants/media-query-breakpoints';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { UserState } from 'src/app/store/user.state';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { SettingsViewService } from '@shared/services';

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
  @ViewChild('grid') readonly grid: IClientSideRowModel;

  @ViewChild('spinner') readonly spinner: ElementRef;

  @Input() showTitle = true;

  @Input() timesheetDetails: TimesheetDetailsModel;

  @Input() isAgency: boolean;

  @Input() actionsDisabled = false;

  @Input() disableAnyAction = false;

  @Input() disableEditButton = false;

  @Input() hasEditTimesheetRecordsPermission: boolean;

  @Input() hasApproveRejectRecordsPermission: boolean;

  @Input() hasApproveRejectMileagesPermission: boolean;

  @Input() canRecalculateTimesheet: boolean;

  @Input() set selectedTab(selectedTab: RecordFields) {
    this.currentTab = selectedTab;

    if (this.grid) {
      this.changeColDefs();
    }
  }

  @Input() set tableRecords(records: TimesheetRecordsDto) {
    this.setTableRecords(records);
  }

  @Output() readonly openAddSideDialog: EventEmitter<OpenAddDialogMeta> = new EventEmitter<OpenAddDialogMeta>();

  @Output() readonly uploadSideDialog: EventEmitter<TimesheetAttachments> = new EventEmitter<TimesheetAttachments>();

  @Output() readonly changesSaved: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() readonly timeSheetChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() readonly rejectEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() readonly approveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() readonly orgSubmitting: EventEmitter<void> = new EventEmitter<void>();

  @Output() readonly closeDetails: EventEmitter<void> = new EventEmitter();

  @Select(TimesheetsState.tmesheetRecords)
  public readonly timesheetRecords$: Observable<TimesheetRecordsDto>;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<DialogActionPayload>;

  public isEditOn = false;

  public readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;

  public timesheetColDef = TimesheetRecordsColdef(false);

  public readonly modules: Module[] = [ClientSideRowModelModule];

  public readonly titleMapper = TableTitleMapper;

  public currentTab: RecordFields = RecordFields.Time;

  public readonly tableTypes = RecordFields;

  public readonly modeValues = RecordsMode;

  public recordsToShow: TimesheetRecordsDto;

  public currentMode: RecordsMode = RecordsMode.View;

  public context: { componentParent: ProfileTimesheetTableComponent };

  public loading = false;

  public isEditEnabled = false;

  public isApproveBtnEnabled = false;

  public isOrgSubmitBtnEnabled = false;

  public isRejectBtnEnabled = false;

  public actionButtonDisabled = false;

  public hasEditPermissions: boolean;

  public hasApproveRejectPermissions: boolean;

  public submitText: string;

  public isTablet = false;

  public isMobile = false;

  public isMiddleContentWidth = false;

  public isSmallContentWidth = false;

  public readonly getRowStyle = (params: { data: {stateText: RecordStatus}}) => {
    if (params.data.stateText === RecordStatus.New) {
      return { 'background-color': '#F2FAF2'};
    }
    if (params.data.stateText === RecordStatus.Deleted) {
      return { 'background-color': '#FFDFDF'};
    }
    return { 'background-color': 'inherit'};
  };

  public readonly getRowClass = (params: { data: {stateText: RecordStatus}}) => {
    return RecordRosStatusClass[params.data.stateText];
  }

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');

  public readonly timesheetStatuses = TimesheetStatus;

  private records: TimesheetRecordsDto;

  private isChangesSaved = true;

  private formControls: Record<string, FormGroup> = {};

  private gridApi: GridApi;

  private idsToDelete: number[] = [];

  private isStatusColAvaliable = false;

  private readonly componentStateChanged$: Subject<ComponentStateChangedEvent> = new Subject();

  private resizeObserver: ResizeObserverModel;

  get dropDownBtnActionItems(): ItemModel[] {
    const actionItems: ItemModel[] = [];

    if (this.canRecalculateTimesheet) {
      actionItems.push({ text: MobileMenuItems.Recalculate });
    }

    if (this.isEditEnabled && !this.actionsDisabled && this.currentTab !== this.tableTypes.Expenses) {
      actionItems.push({
        text: MobileMenuItems.AddRecord,
        disabled: this.disableAnyAction || !this.hasEditPermissions || this.disableEditButton,
      });
    }

    if (
      this.isEditEnabled && !this.actionsDisabled && !this.isEditOn
      && this.recordsToShow?.[this.currentTab]?.[this.modeValues.Edit]?.length
    ) {
      actionItems.push({
        text: MobileMenuItems.Edit,
        disabled: this.disableAnyAction || !this.hasEditPermissions || this.disableEditButton,
      });
    }

    return actionItems;
  }

  public get noMilesReported(): boolean {
    return this.currentTab === this.tableTypes.Miles && !this.timesheetDetails.mileageTimesheetId;
  }

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private timesheetRecordsService: TimesheetRecordsService,
    private timesheetDetailsTableService: TimesheetDetailsTableService,
    private cd: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private settingsViewService: SettingsViewService,
    private actions$: Actions,
  ) {
    super();
    this.context = {
      componentParent: this,
    };
    this.listenMediaQueryBreakpoints();
  }

  ngOnChanges(): void {
    if (this.timesheetDetails) {
      this.submitText = this.isAgency ? SubmitBtnText.Submit : SubmitBtnText.Approve;

      this.initBtnsState();
      this.setActionBtnState();
      this.initEditBtnsState();
      this.subscribeForSettings();
      this.cd.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.watchForDialogState();
    this.adjustColumnWidth();
    this.initResizeObserver();
    this.listenResizeContent();
    this.subscribeOnAddRecordSucceed();
    this.changeColDefs();
    this.subscribeOnTUpdateRecordSucceed();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.detach();
  }

  public openAddDialog(): void {
    const { weekStartDate, weekEndDate, jobEndDate, jobStartDate } = this.store.snapshot().timesheets.timesheetDetails;
    const startDate = DateTimeHelper.setCurrentTimeZone(jobStartDate) > DateTimeHelper.setCurrentTimeZone(weekStartDate)
      ? jobStartDate : weekStartDate;
    const endDate = DateTimeHelper.setCurrentTimeZone(jobEndDate) < DateTimeHelper.setCurrentTimeZone(weekEndDate)
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

  public setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.adjustGrid();
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
    if (!this.timesheetRecordsService.checkFormsValidation(this.formControls)) {
      this.cd.detectChanges();
      return;
    }

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
        this.saveRecords(false);
      });
    } else {
      this.saveRecords();
    }
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

  public reject(): void {
    this.rejectEvent.emit(this.currentTab === RecordFields.Time);
  }

  public approve(): void {
    this.approveEvent.emit(this.currentTab === RecordFields.Time);
  }

  public orgSubmit(): void {
    this.orgSubmitting.emit();
  }

  public uploadAttachments(id: number, attachments: Attachment[]): void {
    this.uploadSideDialog.emit({ id, attachments });
  }

  public selectDropDownBtnActionItem({ item: { text } }: MenuEventArgs): void {
    switch (text) {
      case MobileMenuItems.Recalculate:
        this.recalculateTimesheets();
        break;
      case MobileMenuItems.AddRecord:
        this.openAddDialog();
        break;
      case MobileMenuItems.Edit:
        this.editTimesheets();
        break;
    }
  }

  public listenResizeContent(): void {
    if (this.isTablet) {
      this.resizeObserver.resize$
        .pipe(
          map((data) => data[0].contentRect.width),
          takeUntil(this.componentDestroy())
        )
        .subscribe((containerWidth) => {
          this.isSmallContentWidth = containerWidth <= SmallTabletWidth || this.isMobile;
          this.isMiddleContentWidth = containerWidth <= MiddleTabletWidth;
          this.cd.markForCheck();
        });
    }
  }

  public onComponentStateChanged(event: ComponentStateChangedEvent): void {
    this.componentStateChanged$.next(event);
  }

  public recalculateTimesheets():void {
    this.confirmService.confirm(TimesheetConfirmMessages.recalcTimesheets, {
      title: 'Recalculate Timesheets',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
    .pipe(
      filter((confirm) => confirm),
      take(1),
    )
    .subscribe(() => {
      this.store.dispatch(new TimesheetDetails.RecalculateTimesheets(this.timesheetDetails.jobId));
    });
  }

  private subscribeOnAddRecordSucceed(): void {
    this.actions$
      .pipe(
        ofActionDispatched(TimesheetDetails.AddTimesheetRecordSucceed),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => this.timeSheetChanged.emit(true));
  }

  private subscribeOnTUpdateRecordSucceed(): void {
    this.actions$
      .pipe(
        filter(() => this.checkTabStatusApproved()),
        ofActionDispatched(TimesheetDetails.UpdateRecordSucceed),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.closeDetails.emit();
      });
  }

  private createForm(): void {
    this.formControls = this.timesheetRecordsService.createEditForm(
      this.records, this.currentTab, this.timesheetColDef);
    this.watchFormChanges();
  }

  private adjustGrid(): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.hideOverlay();
    this.cancelChanges();

    if (!this.records[this.currentTab][this.currentMode].length) {
      this.gridApi.showNoRowsOverlay();
    }

    this.cd.markForCheck();
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

  private changeColDefs(): void {
    const { organizationId } = this.store.snapshot().timesheets.timesheetDetails;
    this.adjustGrid();
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
    });
  }

  private watchFormChanges(): void {
    this.timesheetRecordsService.watchFormChanges(this.formControls)
    .pipe(
      filter(() => this.timesheetRecordsService.checkIfFormTouched(this.formControls)),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.isChangesSaved = false;
      this.changesSaved.emit(false);
    });
  }

  private initBtnsState(): void {
    const currentTabMapping: Map<RecordFields, boolean> = new Map<RecordFields, boolean>()
      .set(RecordFields.Time, this.timesheetDetails.canApproveTimesheet)
      .set(RecordFields.Miles, this.timesheetDetails.canApproveMileage);

    this.isApproveBtnEnabled = !!currentTabMapping.get(this.currentTab);
    this.isRejectBtnEnabled = !this.isAgency && !!currentTabMapping.get(this.currentTab);
    this.isOrgSubmitBtnEnabled = this.orgCanSubmitTimesheet();

    if (this.currentTab === this.tableTypes.Miles) {
      this.hasEditPermissions = this.hasApproveRejectMileagesPermission;
      this.hasApproveRejectPermissions = this.hasApproveRejectMileagesPermission;
    } else {
      this.hasEditPermissions = this.hasEditTimesheetRecordsPermission;
      this.hasApproveRejectPermissions = this.hasApproveRejectRecordsPermission;
    }
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

  private subscribeForSettings(): void {
    const currentTabMapping: Map<RecordFields, boolean> = new Map<RecordFields, boolean>()
      .set(RecordFields.Time, this.timesheetDetails.canEditTimesheet)
      .set(RecordFields.Miles, this.timesheetDetails.canEditMileage);
    const user = this.store.selectSnapshot(UserState.user);
    const { organizationId } = this.store.snapshot().timesheets.timesheetDetails;
    if (user?.businessUnitType === BusinessUnitType.Agency) {
      this.settingsViewService
        .getViewSettingKey(
          OrganizationSettingKeys.DisableAddEditTimesheetsInAgencyLogin,
          OrganizationalHierarchy.Organization,
          organizationId,
          organizationId,
          false
        )
        .pipe(
          takeUntil(this.componentDestroy()),
          map(({ DisableAddEditTimesheetsInAgencyLogin }) => {
            return DisableAddEditTimesheetsInAgencyLogin == 'true';
          })
        )
        .subscribe((disabled: boolean) => {
          this.isEditEnabled = !disabled && !!currentTabMapping.get(this.currentTab);
          this.isApproveBtnEnabled = !disabled && !!currentTabMapping.get(this.currentTab);
          this.cd.markForCheck();
        });
    } else {
      this.isEditEnabled = !!currentTabMapping.get(this.currentTab);
      this.cd.markForCheck();
    }
  }

  

  private initEditBtnsState(): void {
    const currentTabMapping: Map<RecordFields, boolean> = new Map<RecordFields, boolean>()
      .set(RecordFields.Time, this.timesheetDetails.canEditTimesheet)
      .set(RecordFields.Miles, this.timesheetDetails.canEditMileage);

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

  private saveRecords(updateDetailsAfter = true): void {
    const diffs = this.timesheetRecordsService.findDiffs(
      this.records[this.currentTab][this.currentMode], this.formControls, this.timesheetColDef);

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

      this.store.dispatch(new TimesheetDetails.PutTimesheetRecords(dto, this.isAgency, updateDetailsAfter));

      this.actions$
      .pipe(
        take(1),
        ofActionDispatched(TimesheetDetails.ForceUpdateRecord),
        switchMap((payload: TimesheetDetails.ForceUpdateRecord) => {
          if (payload.force) {
            return this.confirmService.confirm(payload.message as string, {
              title: payload.title as string,
              okButtonLabel: 'Save',
              okButtonClass: 'ok-button',
              customStyleClass: 'wide-dialog',
            })
            .pipe(
              tap((confirm) => {
                if (!confirm) {
                  this.loading = false;
                  this.cd.markForCheck();
                }
              }),
              filter((confirm) => !!confirm),
              switchMap(() => {
                dto.forceUpdate = true;

                return this.store.dispatch(new TimesheetDetails.PutTimesheetRecords(dto, this.isAgency, updateDetailsAfter));
              }),
            );
          }
          return of();
        }),
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

  private orgCanSubmitTimesheet(): boolean {
    const isOrgAndTimesheetTab = !this.isAgency && this.currentTab === RecordFields.Time;

    const isStatusPass = this.timesheetDetails.status === TimesheetStatus.Missing
      || this.timesheetDetails.status === TimesheetStatus.Rejected;

    return isOrgAndTimesheetTab && this.timesheetDetails.canEditTimesheet && isStatusPass;
  }

  private adjustColumnWidth(): void {
    combineLatest([ this.componentStateChanged$.pipe(throttleTime(150)),
      this.breakpointObserver.observe([BreakpointQuery.TABLET_MAX])])
    .pipe(debounceTime(200), takeUntil(this.componentDestroy())).subscribe(([event, data]) => {
        if(data.matches) {
            event.api.sizeColumnsToFit();
        } else {
          event.columnApi.autoSizeAllColumns();
        }
    });
  }

  private initResizeObserver(): void {
    this.resizeObserver = ResizeObserverService.init(this.targetElement!);
  }

  private listenMediaQueryBreakpoints(): void {
    this.breakpointObserver.observe([BreakpointQuery.TABLET_MAX, BreakpointQuery.MOBILE_MAX])
    .pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
      this.isTablet = data.breakpoints[BreakpointQuery.TABLET_MAX];
      this.isMobile = data.breakpoints[BreakpointQuery.MOBILE_MAX];
    });
  }

  private setTableRecords(records: TimesheetRecordsDto): void {
    this.records = records;
    this.recordsToShow = JSON.parse(JSON.stringify(records));
    this.adjustGrid();
  }
}
