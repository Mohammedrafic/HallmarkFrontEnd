import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { take, filter, Observable, switchMap, takeUntil, tap, throttleTime, of } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';
import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';

import { Destroyable } from '@core/helpers';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import {
  CandidateHoursAndMilesData,
  CandidateInfo,
  DialogActionPayload, TimesheetDetailsInvoice,
  TimesheetRecordsDto,
  TimesheetUploadedFile,
} from '../../interface';
import { DialogAction, SubmitBtnText } from '../../enums';
import { ProfileTimesheetService } from '../../services/profile-timesheet.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ConfirmDeleteTimesheetDialogContent } from '../../constants/confirm-delete-timesheet-dialog-content.const';
import { ShowExportDialog } from '../../../../store/app.actions';
import { ExportColumn, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { FileExtensionsString } from '@core/constants';
import { FileSize } from '@core/enums';


@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePipe,
  ]
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

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  public rejectReasonDialogVisible: boolean = false;

  public isAgency: boolean;

  public submitText: string;

  public candidateId: number;

  public fileName: string = '';

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

  @Select(TimesheetsState.tmesheetRecords)
  public tmesheetRecords$: Observable<TimesheetRecordsDto>;

  @Select(TimesheetsState.isTimesheetOpen)
  public isTimesheetOpen$: Observable<DialogActionPayload>;

  @Select(TimesheetsState.candidateInfo)
  public candidateInfo$: Observable<CandidateInfo>;

  @Select(TimesheetsState.candidateHoursAndMilesData)
  public hoursAndMilesData$: Observable<CandidateHoursAndMilesData>;

  @Select(TimesheetsState.timeSheetAttachments)
  public attachments$: Observable<TimesheetUploadedFile[]>;

  @Select(TimesheetsState.timeSheetInvoices)
  public invoices$: Observable<TimesheetDetailsInvoice[]>;

  public readonly exportedFileType: typeof ExportedFileType = ExportedFileType;
  public readonly allowedFileExtensions: string = FileExtensionsString;
  public readonly maxFileSize: number = FileSize.MB_10;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private profileService: ProfileTimesheetService,
    private cd: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
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
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  public handleUpdateTable(): void {
    // this.getProfileTimesheets();
  }

  public handleDeleteItem({ profileId, tableItemId }: { profileId: number; tableItemId: number | any }): void {
    this.store.dispatch(new Timesheets.DeleteProfileTimesheet(profileId, tableItemId))
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe();
  }

  public openAddDialog(): void {
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Open));
  }

  public handleProfileClose(): void {
    this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Close))
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.candidateDialog.hide();
    });
  }

  public onRejectButtonClick(): void {
    this.rejectReasonDialogVisible = true;
  }

  public onDWNCheckboxSelectedChange({checked}: {checked: boolean}, switchComponent: SwitchComponent): void {
    checked && this.confirmService.confirm(ConfirmDeleteTimesheetDialogContent,{
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
        } else {
          // TODO what's this?
          !submitted && switchComponent.writeValue(false);
        }
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
      tap((data) => { this.candidateId =  data.id }),
      switchMap((data) => this.profileService.getCandidateData(data.id)),
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
}
