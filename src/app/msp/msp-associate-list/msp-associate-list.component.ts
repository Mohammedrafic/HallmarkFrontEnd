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

  constructor(protected override store: Store, private router: Router) {
    super(store);

    this.setHeaderName();
  }

  override ngOnInit(): void {
    super.ngOnInit();

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }
  }

  public addNew(): void {
    this.mspAssociateEvent.emit(true);
  }

  private setHeaderName(): void {
    this.store.dispatch(
      new SetHeaderState({ title: `MSP Associated Agencies`, iconName: 'briefcase' })
    ) 
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(distinctUntilChanged(), takeUntil(this.componentDestroy()))
      .subscribe((value) => {
        this.mspAgencyActionsAllowed = value;
      });
  }
}
