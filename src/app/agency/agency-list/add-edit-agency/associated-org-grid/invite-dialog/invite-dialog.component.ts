import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeWhile } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { GetOrganizationsByPage, InvateOrganizations, InvateOrganizationsSucceeded } from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';

import { Organization } from 'src/app/shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss'],
})
export class InviteDialogComponent implements OnInit {
  @Input() openEvent: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Select(AgencyState.organizations)
  public organizations$: Observable<Organization[]>;

  public targetElement: HTMLElement = document.body;
  public control = new FormControl('');
  public optionFields = {
    text: 'generalInformation.name',
    value: 'organizationId',
  };

  private isAlive = true;

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.store.dispatch(new GetOrganizationsByPage(1, 30));

    this.actions$
      .pipe(
        ofActionSuccessful(InvateOrganizationsSucceeded),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.sideDialog.hide();
      });
  }

  public onInvite(): void {
    this.store.dispatch(new InvateOrganizations(this.control.value));
  }

  public onCancel(): void {
    if (this.control.dirty) {
      this.confirmService
      .confirm(DELETE_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        this.control.reset();
        this.sideDialog.hide();
      });
    } else {
      this.sideDialog.hide();
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        this.control.reset();
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }
}
