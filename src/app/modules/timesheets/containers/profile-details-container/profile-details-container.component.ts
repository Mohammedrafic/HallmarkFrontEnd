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
import { DialogActionPayload } from '../../interface';

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit {
  public readonly status: typeof Status = Status;
  public readonly onboardedStatus: string = ONBOARDED_STATUS;

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Select(TimesheetsState.profileTimesheets)
  timeSheetsProfile$: Observable<ProfileTimeSheetDetail[]>;

  @Select(TimesheetsState.isProfileOpen)
  isProfileOpen$: Observable<DialogActionPayload>;

  public targetElement: HTMLBodyElement;

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
    ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
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
}
