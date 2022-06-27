
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input, OnChanges, SimpleChanges
} from '@angular/core';

import { filter, Observable, takeUntil, throttleTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { Status } from "@shared/enums/status";
import { ONBOARDED_STATUS } from "@shared/components/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst";
import { TimesheetDetails } from "../../store/actions/timesheet-details.actions";
import { ExportPayload } from "@shared/models/export.model";
import { ExportedFileType } from "@shared/enums/exported-file-type";
import { ItemModel } from "@syncfusion/ej2-splitbuttons/src/common/common-model";
import { Uploader } from "@syncfusion/ej2-angular-inputs";

import { DialogActionPayload } from '../../interface';
import { DialogAction } from '../../enums';
import { ExportType } from "../../enums";

interface ExportOption extends ItemModel {
  ext: string | null;
}

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit, OnChanges {
  public readonly status: typeof Status = Status;
  public readonly onboardedStatus: string = ONBOARDED_STATUS;
  public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
  public readonly maxFileSize = 10485760;
  public readonly  exportOptions: ExportOption[] = [
    { text: ExportType.Excel_file, id: '0', ext: 'xlsx' },
    { text: ExportType.CSV_file, id: '1', ext: 'csv' },
    { text: ExportType.Custom, id: '2', ext: null },
  ];
  public rejectReasonDialogVisible: boolean = false;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('dnwDialog') dnwDialog: DialogComponent;
  @ViewChild('uploadButton') uploadBtn: HTMLButtonElement;

  @Select(TimesheetsState.profileTimesheets)
  timeSheetsProfile$: Observable<ProfileTimeSheetDetail[]>;

  @Select(TimesheetsState.isProfileOpen)
  isProfileOpen$: Observable<DialogActionPayload>;

  @Input() currentSelectedRowIndex: number | null = null;
  @Input() maxRowIndex: number = 30;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  public targetElement: HTMLBodyElement;
  public uploadTargetElement: HTMLButtonElement;
  public profileDetailsDialogsTarget: HTMLElement | null = null;
  public isNextDisabled = false;

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
    ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;

    this.isProfileOpen$.pipe(takeUntil(this.componentDestroy())).subscribe(() => {
      this.uploadTargetElement = document.getElementById('profile-details-file-upload-area') as HTMLButtonElement;
      this.profileDetailsDialogsTarget = document.getElementById('dialog_dialog-content') as HTMLElement;
    })
  }

  ngOnInit(): void {
    this.getProfileTimesheets();
    this.getDialogState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSelectedRowIndex'] && !changes['currentSelectedRowIndex'].firstChange) {
      this.isNextDisabled = this.currentSelectedRowIndex === (this.maxRowIndex - 1);
    }
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }

  public handleUpdateTable(): void {
    this.getProfileTimesheets();
  }

  private getProfileTimesheets(): void {
    this.store.dispatch(new Timesheets.GetProfileTimesheets())
    .pipe(takeUntil(this.componentDestroy()));
  }

  private getDialogState(): void {
    this.isProfileOpen$
    .pipe(
      throttleTime(100),
      filter((val) => val.dialogState),
      takeUntil(this.componentDestroy())
      )
    .subscribe((payload) => {
      if (payload.dialogState && payload.rowId) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  public browse(): void {
    document.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }

  public handleOpenSideDialog(): void {
    this.store.dispatch(new Timesheets.OpenProfileTimesheetAddDialog());
  }

  public handleProfileClose(): void {
    this.store.dispatch(new Timesheets.ToggleProfileDialog(DialogAction.Close)).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.sideDialog.hide();
    });
  }

  public onRejectButtonClick(): void {
    this.rejectReasonDialogVisible = true;
  }

  public onDWNCheckboxSelectedChange(show: boolean): void {
    this.isProfileOpen$.pipe(
      filter(() => !!this.dnwDialog && show),
      takeUntil(this.componentDestroy())
    ).subscribe(() => this.dnwDialog.show());
  }

  public export(event: {item: {properties: ExportOption}}): void {
    const fileTypeId = event.item.properties.id as unknown as ExportedFileType;

    this.store.dispatch(new TimesheetDetails.Export(
      new ExportPayload(fileTypeId)
    ));
  }
}
