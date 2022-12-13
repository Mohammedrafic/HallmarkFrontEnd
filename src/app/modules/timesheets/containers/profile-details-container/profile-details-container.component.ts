import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AbstractPermission } from "@shared/helpers/permissions";

import { filter, map, Observable, switchMap, take, takeUntil, tap, throttleTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';

import { DateTimeHelper } from '@core/helpers';
import { DialogAction } from '@core/enums';
import { ConfirmService } from '@shared/services/confirm.service';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { MessageTypes } from '@shared/enums/message-types';
import { ExportColumn, ExportPayload } from '@shared/models/export.model';
import { Attachment, AttachmentsListConfig } from '@shared/components/attachments';
import { TimesheetTargetStatus, TIMETHEETS_STATUSES } from '../../enums';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import {
  CandidateMilesData,
  ChangeStatusData,
  CustomExport,
  DialogActionPayload,
  OpenAddDialogMeta,
  Timesheet,
  TimesheetAttachments,
  TimesheetDetailsModel,
  UploadDocumentsModel,
  WorkWeek
} from '../../interface';
import {
  ConfirmApprovedTimesheetDeleteDialogContent,
  ConfirmDeleteTimesheetDialogContent,
  rejectTimesheetDialogData,
  TimesheetConfirmMessages,
  TimesheetDetailsExportOptions
} from '../../constants';
import { ShowExportDialog, ShowToast } from '../../../../store/app.actions';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { TimesheetDetailsService } from '../../services';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import { FileForUpload, Permission } from '@core/interface';
import { AgencyStatus } from '@shared/enums/status';
import { GRID_CONFIG } from '@shared/constants';
import DeleteRecordAttachment = Timesheets.DeleteRecordAttachment;

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends AbstractPermission implements OnInit {
  @ViewChild('candidateDialog')
  public candidateDialog: DialogComponent;

  /**
   * TODO: move chips to separate shared component.
   */
  @ViewChild('chipList')
  public chipList: ChipListComponent;

  @ViewChild('dnwSwitch')
  public dnwSwitch: SwitchComponent;

  @ViewChild('tooltip')
  public tooltip: TooltipComponent;

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() maxRowIndex: number = GRID_CONFIG.initialRowsPerPage;

  @Output() readonly nextPreviousOrderEvent = new EventEmitter<boolean>();

  public rejectReasonDialogVisible: boolean = false;

  public isAgency: boolean;

  public fileName: string = '';

  public isChangesSaved = true;

  public visible = false;

  public timesheetId: number;

  public mileageTimesheetId: number;

  public organizationId: number | null = null;

  public weekPeriod: [Date, Date] = [new Date(), new Date()];

  public workWeeks: WorkWeek<Date>[];

  public readonly columnsToExport: ExportColumn[] = TimesheetDetailsExportOptions;

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');

  private jobId: number;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<DialogActionPayload>;

  @Select(TimesheetsState.selectedTimeSheet)
  public readonly selectedTimeSheet$: Observable<Timesheet>;

  @Select(TimesheetsState.timesheetDetails)
  public readonly timesheetDetails$: Observable<TimesheetDetailsModel>;

  @Select(TimesheetsState.timesheetDetailsMilesStatistics)
  public readonly milesData$: Observable<CandidateMilesData>;

  public readonly exportedFileType: typeof ExportedFileType = ExportedFileType;

  public readonly timesheetStatus: typeof TimesheetStatus = TimesheetStatus;

  public attachmentsListConfig$: Observable<AttachmentsListConfig>;

  public isDNWEnabled: boolean = false;

  public isNavigationAvaliable = true;

  public isMileageStatusAvailable = true;

  public countOfTimesheetUpdates = 0;

  public disableAnyAction = false;

  public hasEditTimesheetRecordsPermission: boolean;

  /**
   * isTimesheetOrMileagesUpdate used for detect what we try to reject/approve, true = timesheet, false = miles
   * */
  private isTimesheetOrMileagesUpdate: boolean = true;

  constructor(
    protected override store: Store,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private router: Router,
    private timesheetDetailsService: TimesheetDetailsService,

    private cd: ChangeDetectorRef,
  ) {
    super(store);
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
    this.attachmentsListConfig$ = this.timesheetDetails$.pipe(
      map(({id}) => this.timesheetDetailsService.getAttachmentsListConfig(id, this.organizationId, this.isAgency))
    )
  }

  public get isNextDisabled(): boolean {
    return this.maxRowIndex - 1 === this.currentSelectedRowIndex;
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.watchForPermissions();
    this.getDialogState();
    this.watchForDetails();
    this.startSelectedTimesheetWatching();
    this.closeDialogOnNavigationStart();
    this.setOrgId();
    this.watchForRangeChange();
  }

  public onOpen(args: { preventFocus: boolean }): void {
    args.preventFocus = true;
  }

  public closeDialogOnNavigationStart(): void {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationStart),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => this.closeDialog());
  }

  /**
   * TODO: add debouncer
   */
  public onNextPreviousOrder(next: boolean): void {
    if (!this.isChangesSaved) {
      this.timesheetDetailsService.confirmTimesheetLeave(TimesheetConfirmMessages.confirmOrderChange)
      .subscribe(() => {
        this.nextPreviousOrderEvent.emit(next);
      });
    } else {
      this.nextPreviousOrderEvent.emit(next);
    }
  }

  public handleEditChanges(event: boolean): void {
    this.isChangesSaved = event;
  }

  public openAddDialog(meta: OpenAddDialogMeta): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Open, meta.currentTab, meta.startDate, meta.endDate));
  }

  public openUploadSideDialog(timesheetAttachments: TimesheetAttachments): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetUploadAttachmentsDialog(
      DialogAction.Open,
      timesheetAttachments,
    ));
  }

  public handleProfileClose(): void {
    if (!this.isChangesSaved) {
      this.timesheetDetailsService.confirmTimesheetLeave(TimesheetConfirmMessages.confirmUnsavedChages)
      .subscribe(() => {
        this.closeDialog();
      });
    } else {
      this.closeDialog();
    }
  }

  public onRejectButtonClick(isTimesheetOrMileagesUpdate: boolean): void {
    this.rejectReasonDialogVisible = true;
    this.isTimesheetOrMileagesUpdate = isTimesheetOrMileagesUpdate;
  }

  public beforeRender(e: { target: HTMLElement }): void {
    const parent = e.target.parentNode as ParentNode;
    this.tooltip.content = Array.from(parent.children).indexOf(e.target)
      ? 'Miles Status' : 'Timesheet Status';
  }

  public onDWNCheckboxSelectedChange({checked}: {checked: boolean}, switchComponent: SwitchComponent): void {
    checked ? this.timesheetDetails$
      .pipe(
        map(({ status }: TimesheetDetailsModel) => status === TimesheetStatus.Approved),
        switchMap((approved: boolean) => this.confirmService.confirm(
          approved ? ConfirmApprovedTimesheetDeleteDialogContent : ConfirmDeleteTimesheetDialogContent, {
            title: 'Delete Timesheet',
            okButtonLabel: approved ? 'Yes' : 'Proceed',
            okButtonClass: 'delete-button',
          })),
        take(1),
        tap((submitted: boolean) => !submitted && switchComponent.writeValue(false)),
        filter(Boolean),
        switchMap(() => this.store.dispatch(
          new TimesheetDetails.NoWorkPerformed(true, this.timesheetId, this.organizationId),
        ))
      )
      .subscribe(() => {
        this.store.dispatch(new Timesheets.GetAll())
        this.refreshData();
        this.closeDialog();
      }) : this.store.dispatch(
      new TimesheetDetails.NoWorkPerformed(false, this.timesheetId, this.organizationId)
    )
      .pipe(
        take(1),
      )
      .subscribe(() => this.refreshData());
  }

  public handleReject(reason: string): void {
    this.updateTimesheetStatus(TimesheetTargetStatus.Rejected, { reason })
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.store.dispatch([
          new ShowToast(MessageTypes.Success, rejectTimesheetDialogData(this.isTimesheetOrMileagesUpdate).successMessage),
          new Timesheets.GetAll(),
        ]);

        this.handleProfileClose();
      });
  }

  public updateTimesheetStatus(status: TimesheetTargetStatus, data?: Partial<ChangeStatusData>): Observable<void> {
    return this.store.dispatch(
      new TimesheetDetails.ChangeTimesheetStatus({
        timesheetId: this.isTimesheetOrMileagesUpdate ? this.timesheetId : this.mileageTimesheetId,
        organizationId: this.organizationId,
        targetStatus: status,
        reason: null,
        ...data
      })
    );
  }

  public handleApprove(isTimesheetOrMileagesUpdate: boolean): void {
    const { timesheetId, mileageTimesheetId, organizationId } = this;
    const updateId = isTimesheetOrMileagesUpdate ? timesheetId : mileageTimesheetId;

    (organizationId ?
      this.timesheetDetailsService.submitTimesheet(updateId, organizationId, isTimesheetOrMileagesUpdate)
        : this.timesheetDetailsService.approveTimesheet(updateId, isTimesheetOrMileagesUpdate)
    )
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.handleProfileClose();
        this.store.dispatch(new Timesheets.GetAll());
      });
  }

  public orgSubmit(): void {
    const timesheetDetails = this.store.selectSnapshot(TimesheetsState.timesheetDetails);

    if (timesheetDetails?.isEmpty && !timesheetDetails?.noWorkPerformed) {
      this.orgSubmitEmptyTimesheetWarning();
    } else {
      this.orgSubmitTimesheet(timesheetDetails);
    }
  }

  private orgSubmitEmptyTimesheetWarning(): void {
    this.timesheetDetailsService.orgSubmitEmptyTimesheet().pipe(take(1), takeUntil(this.componentDestroy())).subscribe();
  }

  private orgSubmitTimesheet(timesheetDetails: TimesheetDetailsModel | null): void {
    this.timesheetDetailsService.submitTimesheet(
      this.timesheetId,
      timesheetDetails?.organizationId as number,
      true
    ).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.handleProfileClose();
      this.store.dispatch(new Timesheets.GetAll());
    });
  }

  private startSelectedTimesheetWatching(): void {
    this.selectedTimeSheet$.pipe(
      throttleTime(100),
      filter(Boolean),
      switchMap((timesheet: Timesheet) => {
        this.countOfTimesheetUpdates = 0;
        return this.store.dispatch(new Timesheets.GetTimesheetDetails(
          timesheet.id, timesheet.organizationId, this.isAgency));
      }),
      takeUntil(this.componentDestroy()),
    ).subscribe(
      () => this.chipList?.refresh()
    );
  }

  private watchForDetails(): void {
    this.timesheetDetails$.pipe(
      filter(Boolean),
      filter((details) => !details.isNotExist),
      switchMap((details) => {
        this.timesheetId = details.id;
        this.mileageTimesheetId = details.mileageTimesheetId;
        this.isMileageStatusAvailable = details.mileageStatusText.toLocaleLowerCase() !== TIMETHEETS_STATUSES.NO_MILEAGES_EXIST;

        return this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(
          details.id, details.organizationId, this.isAgency))
      }),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.countOfTimesheetUpdates++;
      this.chipList?.refresh();
      this.cd.detectChanges();
    });
  }

  private getDialogState(): void {
    this.isTimesheetOpen$
    .pipe(
      throttleTime(100),
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.candidateDialog?.show();
    });
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(
      new ShowExportDialog(false)
    );
  }

  public exportProfileDetails(fileType: ExportedFileType): void {
    this.store.dispatch(
      new TimesheetDetails.Export(
        new ExportPayload(fileType),
      )
    )
  }

  public customExport(event: CustomExport): void {
    this.closeExport();
    this.exportProfileDetails(event.fileType);
  }

  public showCustomExportDialog(): void {
    this.fileName = `Timesheet ${this.generateDateTime(this.datePipe)}`;

    this.store.dispatch(
      new ShowExportDialog(true)
    );
  }

  public onFilesSelected(files: FileForUpload[]): void {
    this.store.dispatch(new TimesheetDetails.UploadFiles({
      timesheetId: this.timesheetId,
      organizationId: this.organizationId,
      files,
    }))
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.store.dispatch(
          new Timesheets.GetTimesheetDetails(this.timesheetId, this.organizationId as number, this.isAgency)
        );
      });
  }

  public saveFilesOnRecord(uploadData: UploadDocumentsModel): void {
    this.store.dispatch([
      new Timesheets.UploadMilesAttachments(uploadData.fileForUpload, this.organizationId),
      ...this.prepareFilesForDelete(uploadData.filesForDelete, this.timesheetId, this.organizationId),
    ]).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(
        new Timesheets.GetTimesheetDetails(this.timesheetId, this.organizationId as number, this.isAgency)
      );
    });
  }

  private prepareFilesForDelete(
    arr: Attachment[],
    timesheetId: number,
    organizationId: number | null = null
  ): DeleteRecordAttachment[] {
    return arr.map(file => new Timesheets.DeleteRecordAttachment(timesheetId, organizationId, file));
  }

  private refreshData(): Observable<TimesheetDetailsModel> {
    return this.store.dispatch(
      new Timesheets.GetTimesheetDetails(this.timesheetId, this.organizationId as number, this.isAgency)
    );
  }

  /**
   * TODO: date pipe is always defined, needs check
   */
  private generateDateTime(datePipe: DatePipe): string {
    return datePipe ? datePipe.transform(Date.now(), 'MM/dd/yyyy hh:mm a') as string : '';
  }

  private closeDialog(): void {
    this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Close))
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.candidateDialog.hide();
      if (this.countOfTimesheetUpdates > 1) {
        this.store.dispatch(new Timesheets.GetAll());
      }
    });
  }

  private setOrgId(): void {
    this.timesheetDetails$
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(({ organizationId, weekStartDate, weekEndDate, jobId, candidateWorkPeriods, canEditTimesheet, allowDNWInTimesheets, agencyStatus }) => {
      this.organizationId = this.isAgency ? organizationId : null;
      this.jobId = jobId;
      this.weekPeriod = [
        new Date(DateTimeHelper.convertDateToUtc(weekStartDate)),
        new Date(DateTimeHelper.convertDateToUtc(weekEndDate)),
      ];
      this.workWeeks = candidateWorkPeriods.map((el: WorkWeek<string>): WorkWeek<Date> => ({
        weekStartDate: new Date(DateTimeHelper.convertDateToUtc(el.weekStartDate)),
        weekEndDate: new Date(DateTimeHelper.convertDateToUtc(el.weekEndDate)),
      }));
      this.setDNWBtnState(canEditTimesheet, !!allowDNWInTimesheets);
      this.checkForAllowActions(agencyStatus);
      this.cd.markForCheck();
    });
  }

  private watchForRangeChange(): void {
    this.timesheetDetailsService.watchRangeStream()
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((range) => {
      this.store.dispatch(new TimesheetDetails.GetDetailsByDate(
        this.organizationId as number, range[0], this.jobId, this.isAgency)
      );
    });
  }

  private setDNWBtnState(canEditTimesheet: boolean, allowDNWInTimesheets = false): void {
    this.isDNWEnabled = (this.isAgency || canEditTimesheet) && allowDNWInTimesheets;
  }

  private checkForAllowActions(agencyStatus: AgencyStatus): void {
    const allowResult = agencyStatus === AgencyStatus.Inactive || agencyStatus === AgencyStatus.Terminated;

    this.disableAnyAction = allowResult;
  }

  private watchForPermissions(): void {
    this.getPermissionStream()
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe((permissions: Permission) => {
        this.hasEditTimesheetRecordsPermission = this.isAgency
          ? permissions[this.userPermissions.CanAgencyAddEditDeleteTimesheetRecords]
          : permissions[this.userPermissions.CanOrganizationAddEditDeleteTimesheetRecords];
      });
  }
}
