import { BreakpointObserver } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

import { FileExtensionsString } from '@core/constants';
import { OutsideZone } from '@core/decorators';
import { DialogAction, FileSize } from '@core/enums';
import { DateTimeHelper } from '@core/helpers';
import { DropdownOption, FileForUpload, Permission } from '@core/interface';
import { Actions, ofActionCompleted, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Attachment, AttachmentsListConfig } from '@shared/components/attachments';
import { UploadFileAreaComponent } from '@shared/components/upload-file-area/upload-file-area.component';
import { GRID_CONFIG, OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { DatesRangeType } from '@shared/enums';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BreakpointQuery } from '@shared/enums/media-query-breakpoint.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { MobileMenuItems } from '@shared/enums/mobile-menu-items.enum';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractPermission } from '@shared/helpers/permissions';
import { ExportColumn, ExportPayload } from '@shared/models/export.model';
import { OrganizationStructure } from '@shared/models/organization.model';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';
import {
  AccordionComponent,
  ExpandedEventArgs,
  SelectingEventArgs,
  TabComponent,
} from '@syncfusion/ej2-angular-navigations';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs';
import { SettingsViewService } from '../../../../shared/services/settings-view.service';
import { ShowExportDialog, ShowToast } from '../../../../store/app.actions';
import {
  ConfirmApprovedTimesheetDeleteDialogContent,
  ConfirmDeleteTimesheetDialogContent,
  RecordsTabConfig,
  rejectTimesheetDialogData,
  SwitchingDnwOffForApprovedTimesheetDialogContent,
  TimesheetConfirmMessages,
  TimesheetDetailsExportOptions,
} from '../../constants';
import { RecordFields, TableTabIndex, TimesheetTargetStatus, TIMETHEETS_STATUSES } from '../../enums';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import { TabConfig, TimesheetHistoricalEvent, TimesheetRecordsDto } from '../../interface';
import * as TimesheetInt from '../../interface';
import { TimesheetDetailsApiService, TimesheetDetailsService, TimesheetRecordsService } from '../../services';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import DeleteRecordAttachment = Timesheets.DeleteRecordAttachment;
import { AppState } from 'src/app/store/app.state';
import { Comment } from '@shared/models/comment.model';
import { AlertIdEnum } from '@admin/alerts/alerts.enum';

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends AbstractPermission implements OnInit, AfterViewInit {
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

  @ViewChild('tabs')
  public readonly tabs: TabComponent;

  @ViewChild('historicalEventsAccordion')
  private readonly historicalEventsAccordion: AccordionComponent;

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() comments: Comment[] = [];

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

  public timesheetDetails: TimesheetInt.TimesheetDetailsModel;

  public mileageTimesheetId: number;

  public organizationId: number | null = null;
  public orgId: number | null = null;

  public costCenterId: number | null = null;

  public weekPeriod: [Date, Date] = [new Date(), new Date()];

  public workWeeks: TimesheetInt.WorkWeek<Date>[];

  public historicalEvents: TimesheetHistoricalEvent[] = [];

  public tabsConfig: TabConfig[] = [];

  public currentTab: RecordFields | 'details' = 'details';

  public tableRecords: TimesheetRecordsDto;

  public isTableAttachmentOpen = false;

  public readonly columnsToExport: ExportColumn[] = TimesheetDetailsExportOptions;

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');

  public readonly allowedFileExtensions: string = FileExtensionsString;

  public readonly maxFileSize: number = FileSize.MB_20;

  public rangeType = DatesRangeType.OneWeek;

  private jobId: number;

  public commentContainerId = 0;
  public openEvent:boolean = false;


  @Select(TimesheetsState.orderComments)
  private orderComments$: Observable<Comment[]>;

  @Select(AppState.isSidebarOpened)
  isSideBarDocked$: Observable<boolean>;

  @Select(AppState.isMobileScreen)
  public readonly isMobileScreen$: Observable<boolean>;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<TimesheetInt.DialogActionPayload>;

  @Select(TimesheetsState.selectedTimeSheet)
  public readonly selectedTimeSheet$: Observable<TimesheetInt.Timesheet>;

  @Select(TimesheetsState.timesheetDetails)
  public readonly timesheetDetails$: Observable<TimesheetInt.TimesheetDetailsModel>;

  @Select(TimesheetsState.timesheetDetailsMilesStatistics)
  public readonly milesData$: Observable<TimesheetInt.CandidateMilesData>;

  @Select(TimesheetsState.tmesheetRecords)
  public readonly timesheetRecords$: Observable<TimesheetRecordsDto>;

  @Select(TimesheetsState.billRateTypes)
  private readonly billRates$: Observable<DropdownOption[]>;

  @Select(TimesheetsState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  public readonly exportedFileType: typeof ExportedFileType = ExportedFileType;

  public readonly timesheetStatus: typeof TimesheetStatus = TimesheetStatus;

  public attachmentsListConfig$: Observable<AttachmentsListConfig>;

  /**
   * TODO: combine falgs with object.
   */
  public isDNWEnabled = false;

  public isNavigationAvaliable = true;

  public isMileageStatusAvailable = true;

  public disableAnyAction = false;

  public hasEditTimesheetRecordsPermission: boolean;

  public hasViewTimesheetPermission: boolean;

  public hasApproveRejectTimesheetRecordsPermission: boolean;

  public canRecalculateTimesheet = false;

  public mobileMenu = [{ text: MobileMenuItems.Upload }];

  public isMobile = false;

  public isSmallTabletScreen = false;
  public disableEditButton: boolean = false;

  private resizeObserver: ResizeObserverModel;

  private canRecalculate: boolean;
  private isTimeSheetChanged: boolean;

  previewAttachemnt: boolean = false;
  currentSelectedAttachmentIndex: number = 0;
  navigateTheAttachment$: Subject<number> = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  sideBar:boolean = false;
  expandedItem:boolean = false;

  /**
   * isTimesheetOrMileagesUpdate used for detect what we try to reject/approve, true = timesheet, false = miles
   * */
  private isTimesheetOrMileagesUpdate = true;
  private isFirstOpen = true;
  private slectingindex: number;

  constructor(
    protected override store: Store,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private router: Router,
    private timesheetDetailsService: TimesheetDetailsService,
    private timesheetRecordsService: TimesheetRecordsService,
    private timesheetDetailsApiService: TimesheetDetailsApiService,
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    private actions: Actions,
    private settingsViewService: SettingsViewService,
    private ngZone: NgZone,
  ) {
    super(store);
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
    this.attachmentsListConfig$ = this.timesheetDetails$.pipe(
      map(({ id }) => 
        this.timesheetDetailsService.getAttachmentsListConfig(id, this.organizationId || this.orgId, this.isAgency))
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
    this.watchForRangeChange();
    this.initResizeObserver();
    this.listenResizeToolbar();
    this.observeRecordsLoad();
    this.observeDetails();
    this.sideBarObserver();
    this.watchForTableAttachmentPreview();
  }

  public ngAfterViewInit(): void {
    this.getTimesheetTableRecords();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.detach();
  }

  public trackByTitle(index: number, item: TabConfig): string {
    return item.title;
  }

  public selectTab(selectEvent: SelectingEventArgs): void {
    let alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
    this.expandedItem = false;
    if (!this.isChangesSaved && (this.slectingindex !== selectEvent.selectedIndex)) {
      this.confirmService.confirm(TimesheetConfirmMessages.confirmTabChange, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
        .pipe(take(1),)
        .subscribe((submitted) => {
          if (submitted) {
            this.isChangesSaved = true;
            this.currentTab = this.timesheetRecordsService.getCurrentTabName(selectEvent.selectedIndex);
          } else {
            this.slectingindex = selectEvent.previousIndex;
            this.tabs.select(selectEvent.previousIndex);
          }

          if((AlertIdEnum[AlertIdEnum['Timesheet Level Comments']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()){
            this.tabs.select(0);
            window.localStorage.setItem("TimesheetId", JSON.stringify(0));
            window.localStorage.setItem("OrderPublicId", JSON.stringify(""));
            window.localStorage.setItem("alertTitle", JSON.stringify(""));
            this.expandedItem = true;
          }

          this.cd.detectChanges();
        });
    } else {
      this.currentTab = this.timesheetRecordsService.getCurrentTabName(selectEvent.selectedIndex);

      if (this.currentTab === 'details') {
        this.previewAttachemnt = false;
      }
      if((AlertIdEnum[AlertIdEnum['Timesheet Level Comments']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()){
        this.tabs.select(0);
        window.localStorage.setItem("TimesheetId", JSON.stringify(0));
        window.localStorage.setItem("OrderPublicId", JSON.stringify(""));
        window.localStorage.setItem("alertTitle", JSON.stringify(""));
        this.expandedItem = true;
      }
      this.cd.detectChanges();
    }
  }

  public onOpen(args: { preventFocus: boolean }): void {
    this.isTimeSheetChanged = false;
    args.preventFocus = true;
  }

  public closeDialogOnNavigationStart(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => this.closeDialog());
  }

  public isAttachmentNextDisabled(attachments: Attachment[]): boolean {
    return attachments.length == this.currentSelectedAttachmentIndex + 1;
  }

  public onNextPreviousAttachments(next: boolean): void {
    if (next) {
      this.currentSelectedAttachmentIndex = this.currentSelectedAttachmentIndex + 1;
    } else {
      this.currentSelectedAttachmentIndex = this.currentSelectedAttachmentIndex - 1;
    }
    this.navigateTheAttachment$.next(this.currentSelectedAttachmentIndex);
  }

  public onNextPreviousOrder(next: boolean): void {
    if (!this.isChangesSaved) {
      this.timesheetDetailsService.confirmTimesheetLeave(TimesheetConfirmMessages.confirmOrderChange).subscribe(() => {
        this.nextPreviousOrderEvent.emit(next);
        this.collapseHistoricalEvents();
      });
    } else {
      this.nextPreviousOrderEvent.emit(next);
      this.collapseHistoricalEvents();
    }
    this.previewAttachemnt = false;
  }

  public handleEditChanges(event: boolean): void {
    this.isChangesSaved = event;
  }

  public openAddDialog(meta: TimesheetInt.OpenAddDialogMeta): void {
    this.store.dispatch(
      new Timesheets.ToggleTimesheetAddDialog(
        DialogAction.Open,
        meta.currentTab,
        meta.startDate,
        meta.endDate,
        this.costCenterId
      )
    );
  }

  public openUploadSideDialog(timesheetAttachments: TimesheetInt.TimesheetAttachments): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetUploadAttachmentsDialog(DialogAction.Open, timesheetAttachments));
  }

  public handleProfileClose(): void {
    if (!this.isChangesSaved) {
      this.timesheetDetailsService
        .confirmTimesheetLeave(TimesheetConfirmMessages.confirmUnsavedChages)
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
    this.previewAttachemnt = false;
  }

  public onRejectButtonClick(isTimesheetOrMileagesUpdate: boolean): void {
    this.rejectReasonDialogVisible = true;
    this.isTimesheetOrMileagesUpdate = isTimesheetOrMileagesUpdate;
  }

  public beforeRender(e: { target: HTMLElement }): void {
    const parent = e.target.parentNode as ParentNode;
    this.tooltip.content = Array.from(parent.children).indexOf(e.target) ? 'Miles Status' : 'Timesheet Status';
  }

  public onDWNCheckboxSelectedChange({ checked }: { checked: boolean }, switchComponent: SwitchComponent): void {
    checked
      ? this.timesheetDetails$
          .pipe(
            map(({ status }: TimesheetInt.TimesheetDetailsModel) => status === TimesheetStatus.Approved),
            switchMap((approved: boolean) =>
              this.confirmService.confirm(
                approved ? ConfirmApprovedTimesheetDeleteDialogContent : ConfirmDeleteTimesheetDialogContent,
                {
                  title: 'Delete Timesheet',
                  okButtonLabel: approved ? 'Yes' : 'Proceed',
                  okButtonClass: 'delete-button',
                }
              )
            ),
            take(1),
            tap((submitted: boolean) => !submitted && switchComponent.writeValue(false)),
            filter(Boolean),
            switchMap(() =>
              this.store.dispatch(new TimesheetDetails.NoWorkPerformed(true, this.timesheetId, this.organizationId))
            )
          )
          .subscribe(() => {
            this.refreshGrid();
            this.refreshData();
            this.closeDialog();
          })
      : this.switchDnwOff(switchComponent);
  }

  public handleReject(reason: string): void {
    this.updateTimesheetStatus(TimesheetTargetStatus.Rejected, { reason })
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.store.dispatch([
          new ShowToast(
            MessageTypes.Success,
            rejectTimesheetDialogData(this.isTimesheetOrMileagesUpdate).successMessage
          ),
        ]);

        this.handleProfileClose();
      });
  }

  public updateTimesheetStatus(
    status: TimesheetTargetStatus,
    data?: Partial<TimesheetInt.ChangeStatusData>
  ): Observable<void> {
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
    const timesheetDetails = this.store.selectSnapshot(TimesheetsState.timesheetDetails);

    if (organizationId && timesheetDetails?.isEmpty && !timesheetDetails?.noWorkPerformed) {
      this.submitEmptyTimesheetWarning();
      return;
    }

    (organizationId
      ? this.timesheetDetailsService.submitTimesheet(updateId, organizationId, isTimesheetOrMileagesUpdate)
      : this.timesheetDetailsService.approveTimesheet(updateId, isTimesheetOrMileagesUpdate)
    )
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.handleProfileClose();
      });
  }

  public orgSubmit(): void {
    const timesheetDetails = this.store.selectSnapshot(TimesheetsState.timesheetDetails);

    if (timesheetDetails?.isEmpty && !timesheetDetails?.noWorkPerformed) {
      this.submitEmptyTimesheetWarning();
    } else {
      this.orgSubmitTimesheet(timesheetDetails);
    }
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public exportProfileDetails(fileType: ExportedFileType): void {
    this.store.dispatch(new TimesheetDetails.Export(new ExportPayload(fileType)));
  }

  public customExport(event: TimesheetInt.CustomExport): void {
    this.closeExport();
    this.exportProfileDetails(event.fileType);
  }

  public showCustomExportDialog(): void {
    this.fileName = `Timesheet ${formatDate(Date.now(), 'MM/dd/yyyy HH:mm', 'en-US')}`;

    this.store.dispatch(new ShowExportDialog(true));
  }

  public onFilesSelected(files: FileForUpload[]): void {
    this.store
      .dispatch(
        new TimesheetDetails.UploadFiles({
          timesheetId: this.timesheetId,
          organizationId: this.organizationId,
          files,
        })
      )
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.store.dispatch(
          new Timesheets.GetTimesheetDetails(this.timesheetId, (this.organizationId || this.orgId) as number, this.isAgency)
        );
      });
  }

  public saveFilesOnRecord(uploadData: TimesheetInt.UploadDocumentsModel): void {
    this.store
      .dispatch([
        new Timesheets.UploadMilesAttachments(uploadData.fileForUpload, this.organizationId),
        ...this.prepareFilesForDelete(uploadData.filesForDelete, this.timesheetId, this.organizationId),
      ])
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.store.dispatch(
          new Timesheets.GetTimesheetDetails(this.timesheetId, this.organizationId as number, this.isAgency)
        );
      });
  }

  public listenResizeToolbar(): void {
    const tabletBreakPoint$: Observable<boolean> = this.breakpointObserver
      .observe([BreakpointQuery.TABLET_MAX])
      .pipe(map((data) => data.matches));
    const resizeToolbarObserver$: Observable<number> = this.resizeObserver.resize$.pipe(
      map((data) => data[0].contentRect.width),
      distinctUntilChanged()
    );

    const smallTabletScreenWidth = 760;
    const mobileScreenWidth = +BreakpointQuery.MOBILE_MAX.replace(/\D/g, '');

    combineLatest([tabletBreakPoint$, resizeToolbarObserver$])
      .pipe(
        filter(([isLessMaxTablet, resize]) => Boolean(isLessMaxTablet)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(([isLessMaxTablet, toolbarWidth]) => {
        this.isMobile = toolbarWidth <= mobileScreenWidth;
        this.isSmallTabletScreen = toolbarWidth <= smallTabletScreenWidth;
        this.cd.markForCheck();
      });
  }

  public openFileUploadArea(): void {
    this.uploadFileArea.open();
    this.previewAttachemnt = false;
  }

  public closeDialog(): void {
    this.collapseHistoricalEvents();
    this.store
      .dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Close))
      .pipe(take(1))
      .subscribe(() => {
        this.candidateDialog.hide();
        this.openEvent = false;
        if (this.isTimeSheetChanged) {
          this.refreshGrid();
        }
      });
  }

  public handleTimeSheetChange(): void {
    this.isTimeSheetChanged = true;
  }

  public getHistoricalEvents(event: ExpandedEventArgs): void {
    if (event.isExpanded) {
      this.timesheetDetailsApiService.getTimesheetHistoricalEvents(this.isAgency, this.timesheetId, this.organizationId)
        .pipe(take(1))
        .subscribe((events: TimesheetHistoricalEvent[]) => {
          this.historicalEvents = this.timesheetDetailsService.getSortedHistoricalEvents(events);
          this.cd.markForCheck();
        });
    }
  }

  private refreshGrid(): void {
    this.store.dispatch([new Timesheets.GetAll(), new Timesheets.GetTabsCounts()]);
  }

  private submitEmptyTimesheetWarning(): void {
    this.timesheetDetailsService
      .submitEmptyTimesheet()
      .pipe(take(1))
      .subscribe();
  }

  private orgSubmitTimesheet(timesheetDetails: TimesheetInt.TimesheetDetailsModel | null): void {
    this.timesheetDetailsService
      .submitTimesheet(this.timesheetId, timesheetDetails?.organizationId as number, true)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.handleProfileClose();
      });
  }

  private startSelectedTimesheetWatching(): void {
    this.selectedTimeSheet$
      .pipe(
        throttleTime(100),
        filter((timesheet) => !!timesheet),
        takeUntil(this.componentDestroy())
      )
      .subscribe((timesheet) => {
        this.previewAttachemnt = false;
        this.store.dispatch(new Timesheets.GetTimesheetDetails(timesheet.id, timesheet.organizationId, this.isAgency));
      });
  }

  private prepareFilesForDelete(
    arr: Attachment[],
    timesheetId: number,
    organizationId: number | null = null
  ): DeleteRecordAttachment[] {
    return arr.map((file) => new Timesheets.DeleteRecordAttachment(timesheetId, organizationId, file));
  }

  private refreshData(): Observable<TimesheetInt.TimesheetDetailsModel> {
    return this.store.dispatch(
      new Timesheets.GetTimesheetDetails(this.timesheetId, (this.organizationId || this.orgId) as number, this.isAgency)
    );
  }

  private watchForRangeChange(): void {
    this.timesheetDetailsService
      .watchRangeStream()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((range) => {
        this.previewAttachemnt = false;
        this.store.dispatch(
          new TimesheetDetails.GetDetailsByDate(this.organizationId as number, range[0], this.jobId, this.isAgency)
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
  private allowEditButtonEnabled(): void {
    let organizationId = this.orgId;
    this.settingsViewService.getViewSettingKey(
      OrganizationSettingKeys.TimesheetSubmissionProcess,
      OrganizationalHierarchy.Location,
      organizationId as number,
      organizationId as number,
      false,
      this.jobId
    ).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(({ TimesheetSubmissionProcess }) => {
      let currentdate = new Date();
      let dateDiff = Math.floor((currentdate.valueOf() - this.weekPeriod[0].valueOf()) / (1000 * 3600 * 24));
      if (TimesheetSubmissionProcess == "INT" &&dateDiff <= 30) {
        this.disableEditButton = true;
      }
      else {
        this.disableEditButton = false;
      }

    })
  }

  private watchForPermissions(): void {
    this.getPermissionStream()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((permissions: Permission) => {
        if (this.isAgency) {
          this.hasEditTimesheetRecordsPermission =
            permissions[this.userPermissions.CanAgencyAddEditDeleteTimesheetRecords];
          this.hasApproveRejectTimesheetRecordsPermission =
            permissions[this.userPermissions.CanAgencyAddEditDeleteTimesheetRecords];
          this.hasViewTimesheetPermission = permissions[this.userPermissions.CanAgencyViewTimesheets];
        } else {
          this.hasEditTimesheetRecordsPermission =
            permissions[this.userPermissions.CanOrganizationAddEditDeleteTimesheetRecords];
          this.hasApproveRejectTimesheetRecordsPermission =
            permissions[this.userPermissions.CanOrganizationApproveRejectTimesheets];
          this.hasViewTimesheetPermission = permissions[this.userPermissions.CanOrganizationViewTimesheets];
        }

        this.canRecalculate = permissions[this.userPermissions.CanRecalculateTimesheets];
      });
  }

  private initResizeObserver(): void {
    this.resizeObserver = ResizeObserverService.init(this.targetElement!);
  }

  public onPreviewAttchementClick($event:number){
    this.currentSelectedAttachmentIndex = $event;
    this.previewAttachemnt = true;
  }

  private observeDetails(): void {
    this.timesheetDetails$
      .pipe(
        filter((details) => !!details && !details.isNotExist),
        takeUntil(this.componentDestroy())
      )
      .subscribe((details) => {
        const currentStatus = details.status;
        const isTimesheetSubmitted =
          currentStatus === this.timesheetStatus.Approved ||
          currentStatus === this.timesheetStatus.PendingApproval ||
          currentStatus === this.timesheetStatus.PendingApprovalAsterix;
        this.canRecalculateTimesheet = isTimesheetSubmitted && this.canRecalculate;
        this.timesheetDetails = details;
        this.tabsConfig = [{ title: `Job ID ${this.timesheetDetails?.formattedId}` }, ...RecordsTabConfig];
        this.timesheetId = details.id;
        this.commentContainerId=details.commentContainerId;
        this.mileageTimesheetId = details.mileageTimesheetId;
        this.isMileageStatusAvailable =
          details.mileageStatusText.toLocaleLowerCase() !== TIMETHEETS_STATUSES.NO_MILEAGES_EXIST;
        this.costCenterId = details.departmentId;

        this.organizationId = this.isAgency ? details.organizationId : null;
        this.orgId = details.organizationId;
        this.jobId = details.jobId;
        this.weekPeriod = [
          DateTimeHelper.setCurrentTimeZone(details.weekStartDate),
          DateTimeHelper.setCurrentTimeZone(details.weekEndDate),
        ];
        this.workWeeks = details.candidateWorkPeriods.map(
          (el: TimesheetInt.WorkWeek<string>): TimesheetInt.WorkWeek<Date> => ({
            weekStartDate: new Date(DateTimeHelper.setCurrentTimeZone(el.weekStartDate)),
            weekEndDate: new Date(DateTimeHelper.setCurrentTimeZone(el.weekEndDate)),
          })
        );
        this.setDNWBtnState(details.canEditTimesheet, !!details.allowDNWInTimesheets);
        this.checkForAllowActions(details.agencyStatus);
        this.allowEditButtonEnabled();
        this.getOrderComments();
        this.cd.markForCheck();

        this.store.dispatch([
          new TimesheetDetails.GetTimesheetRecords(details.id, details.organizationId, this.isAgency),
          new TimesheetDetails.GetOrganizationsStructure(details.organizationId, this.isAgency),
        ]);
      });
  }

  private observeRecordsLoad(): void {
    this.actions
      .pipe(
        ofActionCompleted(TimesheetDetails.GetTimesheetRecords),
        tap(() => {
          this.chipList?.refresh();
          this.cd.detectChanges();
        }),
        filter(() => this.store.selectSnapshot(TimesheetsState.isTimesheetOpen)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.candidateDialog?.show();
        this.openEvent = true;
      });
  }

  public getOrderComments(): void {
    this.store.dispatch(new Timesheets.GetOrderComments(this.commentContainerId as number));
    this.orderComments$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((comments: Comment[]) => {
      this.comments = comments;
      this.cd.markForCheck();
    });
  }

  public sideBarObserver(){
    this.isSideBarDocked$
        .pipe(takeUntil(this.componentDestroy()))
        .subscribe((isOpen) => {
          this.sideBar =isOpen;
          if(this.previewAttachemnt){
            this.navigateTheAttachment$.next(this.currentSelectedAttachmentIndex);
          }

        });
  }

  private switchDnwOff(switchComponent: SwitchComponent): void {
    let isApproved: boolean;

    this.timesheetDetails$
      .pipe(
        map(({ status }: TimesheetInt.TimesheetDetailsModel) => status === TimesheetStatus.Approved),
        switchMap((approved: boolean) => {
          isApproved = approved;

          if (!approved) {
            return of(true);
          }

          return this.confirmService.confirm(
            SwitchingDnwOffForApprovedTimesheetDialogContent,
            {
              title: 'DNW Timesheet',
              okButtonLabel: 'Yes',
              okButtonClass: 'delete-button',
            }
          );
        }),
        take(1),
        tap((submitted: boolean) => {
          if (!submitted) {
            switchComponent.writeValue(true);
          }
        }),
        filter(Boolean),
        switchMap(() =>
          this.store.dispatch(new TimesheetDetails.NoWorkPerformed(false, this.timesheetId, this.organizationId))
        ),
        take(1),
      )
      .subscribe(() => {
        if (isApproved) {
          this.refreshGrid();
          this.closeDialog();
        } else {
          this.refreshData();
        }
      });
  }

  private getTimesheetTableRecords(): void {
    this.timesheetRecords$
      .pipe(
        withLatestFrom(this.billRates$, this.organizationStructure$),
        filter(() => !!this.tabs),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(([records, billrates]) => {
        this.tableRecords = records;
        this.timesheetRecordsService.controlTabsVisibility(billrates, this.tabs, this.tableRecords);

        if (this.isFirstOpen) {
          this.tabs.select(TableTabIndex.Time);
          this.isFirstOpen = false;
        }

        this.asyncRefresh();
        this.cd.markForCheck();
      });
  }

  @OutsideZone
  private asyncRefresh(): void {
    setTimeout(() => {
      this.tabs.refreshActiveTabBorder();
    }, 100);
  }

  private watchForTableAttachmentPreview(): void {
    this.actions
      .pipe(
        ofActionSuccessful(FileViewer.Open),
        takeUntil(this.componentDestroy())
      )
      .subscribe(({ payload }) => {
        this.isTableAttachmentOpen =  payload.triggeredFromTable;
        this.previewAttachemnt = true;
        this.cd.markForCheck();
      });
  }

  private collapseHistoricalEvents(): void {
    if (!this.historicalEventsAccordion) {
      return;
    }

    this.historicalEventsAccordion.expandItem(false, 0);
  }
}
