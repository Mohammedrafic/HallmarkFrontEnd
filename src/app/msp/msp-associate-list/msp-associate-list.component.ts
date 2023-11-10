import { Component, EventEmitter, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { AbstractPermission } from "@shared/helpers/permissions";
import { SetHeaderState } from '../../store/app.actions';
import { UserState } from '../../store/user.state';

@Component({
  selector: 'app-msp-associate-list',
  templateUrl: './msp-associate-list.component.html',
  styleUrls: ['./msp-associate-list.component.scss'],
})
export class MSPAssociateListComponent extends AbstractPermission implements OnInit {
  public isAgency = false;
  public mspAssociateEvent = new EventEmitter<boolean>();
  public mspAgencyActionsAllowed = true;

  get getTitle(): string {
    return 'Agencies';
  }

  constructor(protected override store: Store) {
    super(store);

    this.setHeaderName();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public addNew(): void {
    this.mspAssociateEvent.emit(true);
  }

  private setHeaderName(): void {
    this.store.dispatch(
      new SetHeaderState({ title: `MSP Linked Agencies`, iconName: 'briefcase' })
    ) 
  }
}
