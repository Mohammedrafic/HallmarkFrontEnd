import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

import { filter, Observable, takeUntil, throttleTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { CandidateTimesheet, DialogActionPayload } from '../../interface';
import { DialogAction, SubmitBtnText } from '../../enums';


@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit {
  @ViewChild('sideDialog')
  public sideDialog: DialogComponent;

  @ViewChild('dnwDialog')
  public dnwDialog: DialogComponent;

  @ViewChild('uploader')
  public uploader: UploaderComponent;

  @ViewChild('chipList')
  public chipList: ChipListComponent;

  @Input() currentSelectedRowIndex: number | null = null;

  @Input() maxRowIndex: number = 30;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  public candidateDialogTarget: HTMLElement;

  public dropElement: HTMLElement | null = null;

  public dropAreaVisible: boolean = false;

  public rejectReasonDialogVisible: boolean = false;

  public isNextDisabled = false;

  public isAgency: boolean;

  public submitText: string;

  public profileData: any;

  @Select(TimesheetsState.candidateTimesheets)
  public candidateTimesheets$: Observable<CandidateTimesheet[]>;

  @Select(TimesheetsState.isTimesheetOpen)
  public isTimesheetOpen$: Observable<DialogActionPayload>;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
    ) {
    super();
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
    this.submitText = this.isAgency ? SubmitBtnText.Submit : SubmitBtnText.Approve;
  }

  public ngOnInit(): void {
    this.getProfileTimesheets();
    this.getDialogState();
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  public handleUpdateTable(): void {
    this.getProfileTimesheets();
  }

  public handleDeleteItem({ profileId, tableItemId }: { profileId: number; tableItemId: number | any }): void {
    this.store.dispatch(new Timesheets.DeleteProfileTimesheet(profileId, tableItemId))
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe();
  }

  public handleOpenSideDialog(): void {
    this.store.dispatch(new Timesheets.OpenProfileTimesheetAddDialog());
  }

  public handleProfileClose(): void {
    this.store.dispatch(new Timesheets.ToggleProfileDialog(DialogAction.Close))
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.sideDialog.hide();
    });
  }

  public onRejectButtonClick(): void {}

  public onDWNCheckboxSelectedChange(): void {}

  public handleReject(): void {}

  public handleApprove(): void {}

  private getProfileTimesheets(): void {
    this.store.dispatch(new Timesheets.GetProfileTimesheets())
    .pipe(takeUntil(this.componentDestroy()));
  }

  private getDialogState(): void {
    this.isTimesheetOpen$
    .pipe(
      throttleTime(100),
      filter((val) => val.dialogState),
      takeUntil(this.componentDestroy())
      )
    .subscribe((payload) => {});
  }
}
