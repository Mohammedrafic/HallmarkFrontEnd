import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, Subject, takeWhile } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { GetOrganizationsByPage, InvateOrganizations, InvateOrganizationsSucceeded } from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';

import { Organization } from 'src/app/shared/models/organization.model';

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

  constructor(private store: Store, private actions$: Actions) {}

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
    this.sideDialog.hide();
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }
}
