import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { filter, Observable, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { Status } from "@shared/enums/status";
import { ONBOARDED_STATUS } from "@shared/components/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst";
import { Uploader } from "@syncfusion/ej2-angular-inputs";

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit {
  public readonly status: typeof Status = Status;
  public readonly onboardedStatus: string = ONBOARDED_STATUS;
  public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
  public readonly maxFileSize = 10485760;

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @ViewChild('uploadButton') uploadBtn: HTMLButtonElement;

  @Select(TimesheetsState.profileTimesheets)
  timeSheetsProfile$: Observable<ProfileTimeSheetDetail[]>;

  @Select(TimesheetsState.isProfileOpen)
  isProfileOpen$: Observable<DialogActionPayload>;

  public targetElement: HTMLBodyElement;
  public uploadTargetElement: HTMLButtonElement;

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
    ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;

    this.isProfileOpen$.subscribe(() => {
      this.uploadTargetElement = document.getElementById('profile-details-file-upload-area') as HTMLButtonElement;
    })
  }

  ngOnInit(): void {
    this.getProfileTimesheets();
    this.getDialogState();
  }

  private getProfileTimesheets(): void {
    this.store.dispatch(new Timesheets.GetProfileTimesheets())
    .pipe(takeUntil(this.componentDestroy()));
  }

  private getDialogState(): void {
    this.isProfileOpen$
    .pipe(
      filter(() => !!this.sideDialog),
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
}
