import {
  ChangeDetectionStrategy, Component, Inject, OnInit, ViewChildren, AfterViewInit, ViewChild, ChangeDetectorRef
} from '@angular/core';

import { filter, Observable, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { Destroyable } from 'src/app/core/helpers/destroyable.helper';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { GlobalWindow } from 'src/app/core/tokens/document.token';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-profile-details-container',
  templateUrl: './profile-details-container.component.html',
  styleUrls: ['./profile-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsContainerComponent extends Destroyable implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Select(TimesheetsState.profileTimesheets)
  timeSheetsProfile$: Observable<ProfileTimeSheetDetail[]>;

  @Select(TimesheetsState.isProfileOpen)
  isProfileOpen$: Observable<boolean>;

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
    this.getToggleState();
  }

  private getProfileTimesheets(): void {
    this.store.dispatch(new Timesheets.GetProfileTimesheets())
    .pipe(takeUntil(this.componentDestroy()));
  }

  private getToggleState(): void {
    this.isProfileOpen$
    .pipe(
      filter(() => !!this.sideDialog),
      takeUntil(this.componentDestroy())
      )
    .subscribe((isOpen) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
      this.cd.markForCheck();
    });
  }
}
