import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { Router } from '@angular/router';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OPTION_FIELDS } from '@shared/components/associate-list/constant';
import { AssociateAgencyToMsp, AssociateAgencyToMspSucceeded } from '../../../store/actions/msp.actions';
import { UserState } from '../../../../store/user.state';
import { MspState } from '../../../store/state/msp.state';

@Component({
  selector: 'app-msp-invite-dialog',
  templateUrl: './msp-invite-dialog.component.html',
  styleUrls: ['./msp-invite-dialog.component.scss'],
})
export class MspInviteDialogComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Select(MspState.mspAssociateAgency)
  public mspAssociateAgency$: Observable<{ id: number, name: string }[]>;

  @Select(UserState.mspName)
  public mspName$: Observable<string>;

  get title(): string {
    return 'Agency';
  }

  public targetElement: HTMLElement = document.body;
  public control = new FormControl('', Validators.required);
  public optionFields = OPTION_FIELDS;
  public isAgency = false;

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.onOpenEvent();
    this.subscribeOnSuccessInviteAgency();
  }

  public onInvite(): void {
    if (this.control.dirty) {
      this.store.dispatch(new AssociateAgencyToMsp(this.control.value));
    } else {
      this.control.markAsTouched();
    }
  }

  public onCancel(): void {
    if (this.control.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.control.reset();
          this.sideDialog.hide();
        });
    } else {
      this.sideDialog.hide();
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe((isOpen: boolean) => {
      if (isOpen) {
        this.control.reset();
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  private subscribeOnSuccessInviteAgency(): void {
    this.actions$.pipe(
      ofActionSuccessful(AssociateAgencyToMspSucceeded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sideDialog.hide();
    });
  }
}
