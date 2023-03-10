import { BreakpointObserver } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

import { FileExtensionsString } from '@core/constants';
import { DialogAction, FileSize } from '@core/enums';
import { DateTimeHelper } from '@core/helpers';
import { FileForUpload, Permission } from '@core/interface';
import { Actions, ofActionCompleted, Select, Store } from '@ngxs/store';
import { Attachment, AttachmentsListConfig } from '@shared/components/attachments';
import { UploadFileAreaComponent } from '@shared/components/upload-file-area/upload-file-area.component';
import { GRID_CONFIG } from '@shared/constants';
import { DatesRangeType } from '@shared/enums';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BreakpointQuery } from '@shared/enums/media-query-breakpoint.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { MobileMenuItems } from '@shared/enums/mobile-menu-items.enum';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractPermission } from "@shared/helpers/permissions";
import { ExportColumn, ExportPayload } from '@shared/models/export.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { combineLatest, distinctUntilChanged, filter, map, Observable,
  switchMap, take, takeUntil, tap, throttleTime } from 'rxjs';
import { ShowExportDialog, ShowToast } from '../../../../store/app.actions';
import {
  ConfirmApprovedTimesheetDeleteDialogContent,
  ConfirmDeleteTimesheetDialogContent,
  rejectTimesheetDialogData,
  TimesheetConfirmMessages,
  TimesheetDetailsExportOptions,
} from '../../constants';
import { TimesheetTargetStatus, TIMETHEETS_STATUSES } from '../../enums';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import * as TimesheetInt from '../../interface';
import { TimesheetDetailsService } from '../../services';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
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

  @ViewChild(UploadFileAreaComponent)
  public readonly uploadFileArea: UploadFileAreaComponent;

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() maxRowIndex: number = GRID_CONFIG.initialRowsPerPage;

  @Output() readonly nextPreviousOrderEvent = new EventEmitter<boolean>();

  /**
   * TODO: save timesheetDetails instead of separate params from it.
   */

  public rejectReasonDialogVisible = false;

  public isAgency: boolean;

  public fileName = '';

  public isChangesSaved = true;

  public visible = false;

  public timesheetId: number;

  public mileageTimesheetId: number;

  public organizationId: number | null = null;

  public costCenterId: number | null = null;

  public weekPeriod: [Date, Date] = [new Date(), new Date()];

  public workWeeks: TimesheetInt.WorkWeek<Date>[];

  public readonly columnsToExport: ExportColumn[] = TimesheetDetailsExportOptions;

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');

  public readonly allowedFileExtensions: string = FileExtensionsString;

  public readonly maxFileSize: number = FileSize.MB_20;

  public rangeType = DatesRangeType.OneWeek;

  private jobId: number;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<TimesheetInt.DialogActionPayload>;

  @Select(TimesheetsState.selectedTimeSheet)
  public readonly selectedTimeSheet$: Observable<TimesheetInt.Timesheet>;

  @Select(TimesheetsState.timesheetDetails)
  public readonly timesheetDetails$: Observable<TimesheetInt.TimesheetDetailsModel>;

  @Select(TimesheetsState.timesheetDetailsMilesStatistics)
  public readonly milesData$: Observable<TimesheetInt.CandidateMilesData>;

  public readonly exportedFileType: typeof ExportedFileType = ExportedFileType;

  public readonly timesheetStatus: typeof TimesheetStatus = TimesheetStatus;

  public attachmentsListConfig$: Observable<AttachmentsListConfig>;

  /**
   * TODO: combine falgs with object.
   */
  public isDNWEnabled = false;

  public isNavigationAvaliable = true;

  public isMileageStatusAvailable = true;

  public countOfTimesheetUpdates = 0;

  public disableAnyAction = false;

  public hasEditTimesheetRecordsPermission: boolean;

  public hasApproveRejectTimesheetRecordsPermission: boolean;

  public mobileMenu = [{ text: MobileMenuItems.Upload }];

  public isMobile = false;

  public isSmallTabletScreen = false;

  private resizeObserver: ResizeObserverModel;

  /**
   * isTimesheetOrMileagesUpdate used for detect what we try to reject/approve, true = timesheet, false = miles
   * */
  private isTimesheetOrMileagesUpdate = true;

  constructor(
    protected override store: Store,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private router: Router,
    private timesheetDetailsService: TimesheetDetailsService,
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    private actions: Actions,
  ) {
    super(store);
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
    this.attachmentsListConfig$ = this.timesheetDetails$.pipe(
      map(({id}) => this.timesheetDetailsService.getAttachmentsListConfig(id, this.organizationId, this.isAgency))
    );
  }

  public get isNextDisabled(): boolean {
    return this.maxRowIndex - 1 === this.currentSelectedRowIndex;
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.watchForPermissions();
    this.startSelectedTimesheetWatching();
    this.closeDialogOnNavigationStart();
    this.setOrgId();
    this.watchForRangeChange();
    this.initResizeObserver();
    this.listenResizeToolbar();
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

  public openAddDialog(meta: TimesheetInt.OpenAddDialogMeta): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Open,
      meta.currentTab, meta.startDate, meta.endDate, this.costCenterId));
  }

  public openUploadSideDialog(timesheetAttachments: TimesheetInt.TimesheetAttachments): void {
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
        map(({ status }: TimesheetInt.TimesheetDetailsModel) => status === TimesheetStatus.Approved),
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
        this.store.dispatch(new Timesheets.GetAll());
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

  public updateTimesheetStatus(status: TimesheetTargetStatus,
    data?: Partial<TimesheetInt.ChangeStatusData>): Observable<void> {
    return this.store.dispatch(
      new TimesheetDetails.ChangeTimesheetStatus({
        timesheetId: this.isTimesheetOrMileagesUpdate ? this.timesheetId : this.mileageTimesheetId,
        organizationId: this.organizationId,
        targetStatus: status,
        reason: null,
        ...data,
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
    );
  }

  public customExport(event: TimesheetInt.CustomExport): void {
    this.closeExport();
    this.exportProfileDetails(event.fileType);
  }

  public showCustomExportDialog(): void {
    this.fileName = `Timesheet ${formatDate(Date.now(), 'MM/dd/yyyy hh:mm a', 'en-US')}`;

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

  public saveFilesOnRecord(uploadData: TimesheetInt.UploadDocumentsModel): void {
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

  public listenResizeToolbar(): void {
    const tabletBreakPoint$: Observable<boolean> = this.breakpointObserver
    .observe([BreakpointQuery.TABLET_MAX]).pipe(map((data) => data.matches));
    const resizeToolbarObserver$: Observable<number> = this.resizeObserver.resize$
    .pipe(map((data) => data[0].contentRect.width), distinctUntilChanged());

    const smallTabletScreenWidth = 760;
    const mobileScreenWidth = +BreakpointQuery.MOBILE_MAX.replace(/\D/g, "");

      combineLatest([tabletBreakPoint$, resizeToolbarObserver$])
        .pipe(filter(([isLessMaxTablet, resize]) => Boolean(isLessMaxTablet)), takeUntil(this.componentDestroy()))
        .subscribe(([isLessMaxTablet, toolbarWidth]) => {
          this.isMobile = toolbarWidth <= mobileScreenWidth;
          this.isSmallTabletScreen = toolbarWidth <= smallTabletScreenWidth;
          this.cd.markForCheck();
        });
  }

  public openFileUploadArea(): void {
    this.uploadFileArea.open();
  }

  public onMobileMenuSelect({ item: { text }}: MenuEventArgs): void {
    if(text === MobileMenuItems.Upload) {
      setTimeout(() => this.openFileUploadArea());
    }
  }

  private orgSubmitEmptyTimesheetWarning(): void {
    this.timesheetDetailsService.orgSubmitEmptyTimesheet().pipe(take(1), takeUntil(this.componentDestroy())).subscribe();
  }

  private orgSubmitTimesheet(timesheetDetails: TimesheetInt.TimesheetDetailsModel | null): void {
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
      switchMap((timesheet: TimesheetInt.Timesheet) => {
        this.countOfTimesheetUpdates = 0;
        this.store.dispatch(new Timesheets.GetTimesheetDetails(
          timesheet.id, timesheet.organizationId, this.isAgency));
        return this.actions;
      }),
      ofActionCompleted(Timesheets.GetTimesheetDetails),
      switchMap(() => {
        return this.timesheetDetails$;
      }),
      filter(Boolean),
      filter((details) => !details.isNotExist),
      switchMap((details) => {
        this.timesheetId = details.id;
        this.mileageTimesheetId = details.mileageTimesheetId;
        this.isMileageStatusAvailable = details.mileageStatusText
        .toLocaleLowerCase() !== TIMETHEETS_STATUSES.NO_MILEAGES_EXIST;
        this.costCenterId = details.departmentId;

        this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(
          details.id, details.organizationId, this.isAgency));

        return this.actions;
      }),
      ofActionCompleted(TimesheetDetails.GetTimesheetRecords),
      tap(() => {
        // eslint-disable-next-line no-plusplus
        this.countOfTimesheetUpdates++;
        this.chipList?.refresh();
        this.cd.detectChanges();
      }),
      tap(() => {
        this.chipList?.refresh();
      }),
      filter(() => this.store.selectSnapshot(TimesheetsState.isTimesheetOpen)),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.candidateDialog?.show();
    });
  }

  private prepareFilesForDelete(
    arr: Attachment[],
    timesheetId: number,
    organizationId: number | null = null
  ): DeleteRecordAttachment[] {
    return arr.map(file => new Timesheets.DeleteRecordAttachment(timesheetId, organizationId, file));
  }

  private refreshData(): Observable<TimesheetInt.TimesheetDetailsModel> {
    return this.store.dispatch(
      new Timesheets.GetTimesheetDetails(this.timesheetId, this.organizationId as number, this.isAgency)
    );
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
    .subscribe(({ organizationId, weekStartDate, weekEndDate, jobId,
      candidateWorkPeriods, canEditTimesheet, allowDNWInTimesheets, agencyStatus }) => {
      this.organizationId = this.isAgency ? organizationId : null;
      this.jobId = jobId;
      this.weekPeriod = [
        DateTimeHelper.convertDateToUtc(weekStartDate),
        DateTimeHelper.convertDateToUtc(weekEndDate),
      ];
      this.workWeeks = candidateWorkPeriods.map((el: TimesheetInt.WorkWeek<string>): TimesheetInt.WorkWeek<Date> => ({
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
        if (this.isAgency) {
          this.hasEditTimesheetRecordsPermission =
            permissions[this.userPermissions.CanAgencyAddEditDeleteTimesheetRecords];
          this.hasApproveRejectTimesheetRecordsPermission =
            permissions[this.userPermissions.CanAgencyAddEditDeleteTimesheetRecords];
        } else {
          this.hasEditTimesheetRecordsPermission =
            permissions[this.userPermissions.CanOrganizationAddEditDeleteTimesheetRecords];
          this.hasApproveRejectTimesheetRecordsPermission =
            permissions[this.userPermissions.CanOrganizationApproveRejectTimesheets];
        }
      });
  }

  private initResizeObserver(): void {
    this.resizeObserver = ResizeObserverService.init(this.targetElement!);
  }
}
