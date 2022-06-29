import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { TIMETHEETS_STATUSES } from './../../enums/timesheets.enum';
import { Router } from '@angular/router';
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

import { filter, Observable, takeUntil, throttleTime, debounceTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent, TooltipComponent } from '@syncfusion/ej2-angular-popups';

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
import { Invoice, ProfileUploadedFile } from "../../interface";
import { UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';

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

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('dnwDialog') dnwDialog: DialogComponent;
  @ViewChild('uploadTooltip') uploadTooltip: TooltipComponent;

  @ViewChild('uploader')
  public uploader: UploaderComponent;

  @ViewChild('chipList') chipList: ChipListComponent;

  @Select(TimesheetsState.profileTimesheets)
  timeSheetsProfile$: Observable<ProfileTimeSheetDetail[]>;

  @Select(TimesheetsState.isProfileOpen)
  isProfileOpen$: Observable<DialogActionPayload>;

  @Input() currentSelectedRowIndex: number | null = null;
  @Input() maxRowIndex: number = 30;

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @Select(TimesheetsState.timeSheetDetailsUploads)
  public uploadedFiles$: Observable<ProfileUploadedFile[]>;

  @Select(TimesheetsState.timesheetDetailsInvoices)
  public invoices$: Observable<Invoice[]>;

  public targetElement: HTMLBodyElement;
  public profileDetailsDialogsTarget: HTMLElement | null = null;
  public dropElement: HTMLElement | null = null;
  public dropAreaVisible: boolean = false;
  public rejectReasonDialogVisible: boolean = false;
  public isNextDisabled = false;
  isAgency: boolean;
  submitText: string;
  profileData: any;
  profileId: number;

  constructor(
    private store: Store,
    private router: Router,
    private cd: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
    ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;

    /**
     * TODO: remove this in a method, get rid of getElementById
     */
    this.isProfileOpen$.pipe(takeUntil(this.componentDestroy())).subscribe(() => {
      this.profileDetailsDialogsTarget = document.getElementById('dialog_dialog-content') as HTMLElement;
      this.dropElement = document.getElementById('timesheet-details-files-droparea') as HTMLElement;
    });

    this.isAgency = this.router.url.includes('agency');
    this.submitText = this.isAgency ? 'Submit' : 'Approve';
  }

  public ngOnInit(): void {
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
    this.cd.detectChanges();
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
      this.profileData = JSON.parse(localStorage.getItem('profile') as string);
      this.chipList.cssClass = this.chipPipe.transform(this.profileData.status);

      if (payload.dialogState && payload.rowId) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
      this.cd.detectChanges();
    });
  }

  public browse(): void {
    document.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }

  public handleOpenSideDialog(id: number): void {
    this.profileId = id;
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

  public onFileSelected(event: { filesData: File[]}): void {
    const [{name, type}] = event.filesData;

    this.store.dispatch(
      new TimesheetDetails.AddFile({name, type})
    ).subscribe(() => this.hideUploadArea());
  }

  public hideUploadArea(): void {
    this.dropAreaVisible = false;
    this.uploadTooltip.close();
  }

  public showUploadArea(container: HTMLElement): void {
    if (this.dropAreaVisible) {
      this.hideUploadArea();
    } else {
      this.dropAreaVisible = true;
      this.uploadTooltip.open(container);
    }
  }

  handleApprove(): void {
    if (this.isAgency) {
      const profile = JSON.parse(localStorage.getItem('profile') as string);
      profile.status = TIMETHEETS_STATUSES.PENDING_APPROVE;
      localStorage.setItem('profile', JSON.stringify(profile));

      const timesheets = JSON.parse(localStorage.getItem('timesheets') as string);

      const updatedTimesheets = timesheets.items.map((item: any) => {
        if (item.id === profile.id) {
          item.status = TIMETHEETS_STATUSES.PENDING_APPROVE;
        }
        return item;
      });

      localStorage.setItem('timesheets', JSON.stringify(
        {
          ...timesheets,
          items: updatedTimesheets,
        }
      ));

      const timesheet = JSON.parse(localStorage.getItem('timesheet-details-tables') as string);
      const temp = localStorage.getItem('submited-timsheets');
      let submitted: any[];

      if (temp) {
        submitted = JSON.parse(temp);
      } else {
        submitted = [];
      }

      submitted.push(
        {
          ...profile,
          timesheets: timesheet,
        },
      );

      localStorage.setItem('submited-timsheets', JSON.stringify(submitted));
      this.store.dispatch(Timesheets.GetAll);

    }
  }
}
