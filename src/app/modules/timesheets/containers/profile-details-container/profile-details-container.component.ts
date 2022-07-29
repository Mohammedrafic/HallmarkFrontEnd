import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { filter, forkJoin, Observable, switchMap, take, takeUntil, tap, throttleTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';
import { SelectedEventArgs } from '@syncfusion/ej2-angular-inputs';
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { FileSize } from '@core/enums';
import { DialogAction, SubmitBtnText, TimesheetTargetStatus } from '../../enums';
import { FileExtensionsString } from '@core/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { MessageTypes } from '@shared/enums/message-types';
import { ExportColumn, ExportPayload } from '@shared/models/export.model';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import {
  CandidateMilesData,
  ChangeStatusData,
  DialogActionPayload,
  OpenAddDialogMeta,
  Timesheet,
  TimesheetDetailsModel
} from '../../interface';
import {
  ConfirmDeleteTimesheetDialogContent,
  ConfirmUnsavedChages,
  rejectTimesheetDialogData,
  TimesheetDetailsExportOptions
} from '../../constants';
import { ShowExportDialog, ShowToast } from '../../../../store/app.actions';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { TimesheetDetailsService } from '../../services/timesheet-details.service';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit {
  @ViewChild('candidateDialog')
  public candidateDialog: DialogComponent;

  @ViewChild('chipList')
  public chipList: ChipListComponent;

  @ViewChild('dropEl')
  public dropEl: HTMLDivElement;

  @ViewChild('uploadTooltip')
  public uploadTooltip: TooltipComponent;

  @ViewChild('uploadArea')
  public uploadArea: ElementRef<HTMLDivElement>;

  @ViewChild('dnwSwitch')
  public dnwSwitch: SwitchComponent;

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() maxRowIndex: number = 30;

  @Output() readonly nextPreviousOrderEvent = new EventEmitter<boolean>();

  public rejectReasonDialogVisible: boolean = false;

  public isAgency: boolean;

  public submitText: string;

  public fileName: string = '';

  public isChangesSaved = true;

  public visible = false;

  public timesheetId: number;

  public organizationId: number | null = null;

  public weekPeriod: [Date, Date] = [new Date(), new Date()];

  public readonly columnsToExport: ExportColumn[] = TimesheetDetailsExportOptions;

  public actionButtonDisabled = false;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<DialogActionPayload>;

  @Select(TimesheetsState.selectedTimeSheet)
  public readonly selectedTimeSheet$: Observable<Timesheet>;

  @Select(TimesheetsState.timesheetDetails)
  public readonly timesheetDetails$: Observable<TimesheetDetailsModel>;

  @Select(TimesheetsState.timesheetDetailsMilesStatistics)
  public readonly milesData$: Observable<CandidateMilesData>

  public readonly exportedFileType: typeof ExportedFileType = ExportedFileType;
  public readonly allowedFileExtensions: string = FileExtensionsString;
  public readonly maxFileSize: number = FileSize.MB_10;
  public readonly timesheetStatus: typeof TimesheetStatus = TimesheetStatus;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private router: Router,
    private timesheetDetailsService: TimesheetDetailsService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
    this.submitText = this.isAgency ? SubmitBtnText.Submit : SubmitBtnText.Approve;
  }

  public get isNextDisabled(): boolean {
    return this.maxRowIndex - 1 === this.currentSelectedRowIndex;
  }

  public ngOnInit(): void {
    this.getDialogState();
    this.startSelectedTimesheetWatching();
    this.closeDialogOnNavigationStart();
    this.setOrgId();
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
    this.nextPreviousOrderEvent.emit(next);
  }

  public handleEditChanges(event: boolean): void {
    this.isChangesSaved = event;
  }

  public openAddDialog(meta: OpenAddDialogMeta): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Open, meta.currentTab, meta.initDate));
  }

  public handleProfileClose(): void {
    if (!this.isChangesSaved) {
      this.confirmService.confirm(ConfirmUnsavedChages, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        take(1),
        filter((submitted) => submitted)
      )
      .subscribe(() => {
        this.closeDialog();
      });
    } else {
      this.closeDialog();
    }
  }

  public onRejectButtonClick(): void {
    this.rejectReasonDialogVisible = true;
  }

  public onDWNCheckboxSelectedChange({checked}: {checked: boolean}, switchComponent: SwitchComponent): void {
    checked ? this.confirmService.confirm(ConfirmDeleteTimesheetDialogContent, {
      title: 'Delete Timesheet',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
      .pipe(
        take(1),
        tap((submitted: boolean) => !submitted && switchComponent.writeValue(false)),
        filter(Boolean),
        switchMap(() => this.store.dispatch(
          new TimesheetDetails.NoWorkPerformed(true, this.timesheetId, this.organizationId),
        ))
      )
      .subscribe(() => {
        this.closeDialog();
        this.refreshData();
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
          new ShowToast(MessageTypes.Success, rejectTimesheetDialogData.successMessage),
          new Timesheets.GetAll(),
        ]);

        this.handleProfileClose();
      });
  }

  public updateTimesheetStatus(status: TimesheetTargetStatus, data?: Partial<ChangeStatusData>): Observable<void> {
    return this.store.dispatch(
      new TimesheetDetails.ChangeTimesheetStatus({
        timesheetId: this.timesheetId,
        organizationId: this.organizationId,
        targetStatus: status,
        reason: null,
        ...data
      })
    );
  }

  public handleApprove(): void {
    const { timesheetId, organizationId } = this;

    (organizationId ?
      this.timesheetDetailsService.submitTimesheet(timesheetId, organizationId) :
      this.timesheetDetailsService.approveTimesheet(timesheetId)
    )
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.handleProfileClose();
        this.store.dispatch(new Timesheets.GetAll());
      });
  }

  private startSelectedTimesheetWatching(): void {
    this.selectedTimeSheet$.pipe(
      throttleTime(100),
      filter(Boolean),
      switchMap((timesheet: Timesheet) => {
        this.timesheetId = timesheet.id;

        return forkJoin([
          this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(
            timesheet.id, timesheet.organizationId, this.isAgency)),
          this.store.dispatch(new Timesheets.GetTimesheetDetails(
            timesheet.id, timesheet.organizationId, this.isAgency))
        ]);
      }),
      takeUntil(this.componentDestroy()),
    ).subscribe(
      () => this.chipList?.refresh()
    );
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

  /**
   * TODO: move event interface to interface folder and get rid of any
   */
  public customExport(event: {columns: any[]; fileName: string; fileType: ExportedFileType }): void {
    this.closeExport();
    this.exportProfileDetails(event.fileType);
  }

  public showCustomExportDialog(): void {
    this.fileName = `Timesheet ${this.generateDateTime(this.datePipe)}`;

    this.store.dispatch(
      new ShowExportDialog(true)
    );
  }

  public onFilesSelected(event: SelectedEventArgs, orgId: number): void {
    this.store.dispatch(new TimesheetDetails.UploadFiles({
      timesheetId: this.timesheetId,
      organizationId: this.isAgency ? orgId : null,
      files: event.filesData.map((fileData) => {
        return {
          blob: fileData.rawFile as Blob,
          fileName: fileData.name,
        }
      }),
    }))
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.store.dispatch(
          new Timesheets.GetTimesheetDetails(this.timesheetId, this.organizationId as number, this.isAgency)
        );
      });

    this.uploadTooltip?.close();
  }

  /**
   * TODO: change this method
   */
  public browse() : void {
    this.uploadArea.nativeElement
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
  }

  private refreshData(): Observable<unknown> {
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
    ).subscribe(() => this.candidateDialog.hide());
  }

  private setOrgId(): void {
    this.timesheetDetails$
    .pipe(
      filter(Boolean),
      tap((details) => { this.setActionBtnState(details)}),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(({ organizationId, weekStartDate, weekEndDate }) => {
      this.organizationId = this.isAgency ? organizationId : null;
      this.weekPeriod = [
        new Date(DateTimeHelper.convertDateToUtc(weekStartDate)),
        new Date(DateTimeHelper.convertDateToUtc(weekEndDate)),
      ]
      this.cd.markForCheck();
    });
  }

  private setActionBtnState(details: TimesheetDetailsModel): void {
    if (this.isAgency) {
      this.actionButtonDisabled = details.status === this.timesheetStatus.PendingApproval
      || details.status === this.timesheetStatus.Approved;
    } else {
      this.actionButtonDisabled = details.status === this.timesheetStatus.Approved
    }
  }
}

