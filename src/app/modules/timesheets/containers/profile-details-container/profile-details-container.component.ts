import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

import { filter, Observable, switchMap, take, takeUntil, throttleTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { ChipListComponent, SwitchComponent } from '@syncfusion/ej2-angular-buttons';

import { Destroyable } from '@core/helpers';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import {
  CandidateInfo, DialogActionPayload, TimesheetUploadedFile, TimesheetRecordsDto, CandidateHoursAndMilesData,
} from '../../interface';
import { DialogAction, SubmitBtnText } from '../../enums';
import { ProfileTimesheetService } from '../../services/profile-timesheet.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ConfirmDeleteTimesheetDialogContent } from '../../constants/confirm-delete-timesheet-dialog-content.const';


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

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() maxRowIndex: number = 30;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  public rejectReasonDialogVisible: boolean = false;

  public isAgency: boolean;

  public submitText: string;

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

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private profileService: ProfileTimesheetService,
    private cd: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    private confirmService: ConfirmService,
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

  public onRejectButtonClick(): void {}

  public onDWNCheckboxSelectedChange({checked}: {checked: boolean}, switchComponent: SwitchComponent): void {
    checked && this.confirmService.confirm(ConfirmDeleteTimesheetDialogContent,{
      title: 'Delete Timesheet',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
      .pipe(
        take(1)
      )
      .subscribe((submitted: boolean) => !submitted && switchComponent.writeValue(false));
  }

  public handleReject(): void {}

  public handleApprove(): void {}

  private getDialogState(): void {
    this.isTimesheetOpen$
    .pipe(
      throttleTime(100),
      filter((data) => data.dialogState),
      switchMap((data) => this.profileService.getCandidateData(data.id)),
      takeUntil(this.componentDestroy())
      )
    .subscribe(() => {
      this.candidateDialog.show();
    });
  }
}
