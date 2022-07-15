import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { take, filter, Observable, takeUntil, tap, throttleTime, distinctUntilChanged } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';
import { SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';

import { Destroyable } from '@core/helpers';
import { FileSize } from '@core/enums';
import { FileExtensionsString } from '@core/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportPayload } from '@shared/models/export.model';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import {
  CandidateHoursAndMilesData,
  CandidateInfo,
  DialogActionPayload,
  TimesheetRecordsDto,
  TimesheetDetailsModel, CandidateMilesData,
} from '../../interface';
import { DialogAction, SubmitBtnText } from '../../enums';
import {
  ConfirmDeleteTimesheetDialogContent,
  ConfirmUnsavedChages,
} from '../../constants/confirm-delete-timesheet-dialog-content.const';
import { ShowExportDialog } from '../../../../store/app.actions';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { CandidateService } from '@agency/services/candidates.service';


@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit {
  @ViewChild('candidateDialog')
  public candidateDialog: DialogComponent;

  @ViewChild('dnwDialog')
  public dnwDialog: DialogComponent;


  @ViewChild('uploader')
  public uploader: UploaderComponent;

  @ViewChild('chipList')
  public chipList: ChipListComponent;

  @ViewChild('dropEl')
  public dropEl: HTMLDivElement;

  @ViewChild('uploadTooltip')
  public uploadTooltip: TooltipComponent;

  @ViewChild('uploadArea')
  public uploadArea: ElementRef<HTMLDivElement>;

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() maxRowIndex: number = 30;

  @Output() readonly nextPreviousOrderEvent = new EventEmitter<boolean>();

  public rejectReasonDialogVisible: boolean = false;

  public isAgency: boolean;

  public submitText: string;

  public candidateId: number;

  public fileName: string = '';

  private isChangesSaved = true;

  public readonly columnsToExport: ExportColumn[] = [
    { text:'First Name', column: 'firstName'},
    { text:'Last Name', column: 'lastName'},
    { text:'Job Title', column: 'jobTitle'},
    { text:'Location', column: 'location'},
    { text:'Department', column: 'department'},
    { text:'Skill', column: 'skill'},
    { text:'Start Date', column: 'startDate'},
    { text:'End Date', column: 'endDate'},
  ];

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<DialogActionPayload>;

  @Select(TimesheetsState.candidateInfo)
  public readonly candidateInfo$: Observable<CandidateInfo>;

  @Select(TimesheetsState.candidateHoursAndMilesData)
  public readonly hoursAndMilesData$: Observable<CandidateHoursAndMilesData>;

  @Select(TimesheetsState.timesheetDetails)
  public readonly timesheetDetails$: Observable<TimesheetDetailsModel>;

  @Select(TimesheetsState.timesheetDetailsMilesStatistics)
  public readonly milesData$: Observable<CandidateMilesData>

 @Select(TimesheetsState.timesheetDetailsChartsVisible)
  public readonly chartsVisible$: Observable<boolean>

  public readonly exportedFileType: typeof ExportedFileType = ExportedFileType;
  public readonly allowedFileExtensions: string = FileExtensionsString;
  public readonly maxFileSize: number = FileSize.MB_10;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private candidateService: CandidateService,
    private router: Router,
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
    this.closeDialogOnNavigationStart();
  }

  public closeDialogOnNavigationStart(): void {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationStart),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => this.handleProfileClose());
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  public handleEditChanges(event: boolean): void {
    this.isChangesSaved = event;
  }

  public handleUpdateTable(): void {}

  public openAddDialog(): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Open));
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
    checked && this.confirmService.confirm(ConfirmDeleteTimesheetDialogContent, {
      title: 'Delete Timesheet',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
      .pipe(
        take(1),
      )
      .subscribe((submitted: boolean) => {
        if (submitted) {
          this.store.dispatch([
            new Timesheets.ToggleCandidateDialog(DialogAction.Close),
            new Timesheets.DeleteTimesheet(this.candidateId),
          ]).subscribe(() => this.handleProfileClose());
        }

        switchComponent.writeValue(false);
      });
  }

  public handleReject(reason: string): void {
    this.store.dispatch(new TimesheetDetails.RejectTimesheet(this.candidateId, reason))
      .subscribe(() => this.handleProfileClose());
  }

  public handleApprove(): void {
    const id = this.candidateId;
    this.store.dispatch(
      this.isAgency ? new TimesheetDetails.AgencySubmitTimesheet(id) :
        new TimesheetDetails.OrganizationApproveTimesheet(id)
    ).pipe(
      tap(() => this.handleProfileClose())
    );
  }

  private getDialogState(): void {
    this.isTimesheetOpen$
    .pipe(
      throttleTime(100),
      filter((data) => data.dialogState),
      distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
      tap(({ id }) => {
        this.candidateId = id;
        this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(id));
        this.store.dispatch(new Timesheets.GetTimesheetDetails(id));
      }),
      takeUntil(this.componentDestroy())
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

  public onFilesSelected(event: SelectedEventArgs): void {
    const blobList: Blob[] = event.filesData.map(file => file.rawFile as Blob);
    const names: string[] = event.filesData.map(file => file.name);

    this.store.dispatch(new TimesheetDetails.UploadFiles(this.candidateId, blobList, names));
    this.uploadTooltip?.close();
  }

  public browse() : void {
    this.uploadArea.nativeElement
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
  }

  private generateDateTime(datePipe: DatePipe): string {
    return datePipe ? datePipe.transform(Date.now(), 'MM/dd/yyyy hh:mm a') as string : '';
  }

  private closeDialog(): void {
    this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Close))
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => this.candidateDialog.hide());
  }
}
