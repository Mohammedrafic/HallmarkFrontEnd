import { Component, EventEmitter, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';
import { Router } from '@angular/router';
import { UserState } from '../../../store/user.state';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { AbstractPermission } from "@shared/helpers/permissions";

@Component({
  selector: 'app-associate-list',
  templateUrl: './associate-list.component.html',
  styleUrls: ['./associate-list.component.scss'],
})
export class AssociateListComponent extends AbstractPermission implements OnInit {
  public isAgency = false;
  public associateEvent = new EventEmitter<boolean>();
  public agencyActionsAllowed = true;

  get getTitle(): string {
    return this.isAgency ? 'Organizations' : 'Agencies';
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
    this.associateEvent.emit(true);
  }

  private setHeaderName(): void {
    this.isAgency = this.router.url.includes('agency');
    !this.isAgency ? this.store.dispatch(
      new SetHeaderState({ title: `Associated Agencies`, iconName: 'briefcase' })
    ) : this.store.dispatch(
      new SetHeaderState({ title: `Associated Organizations`, iconName: 'organization', custom: true })
    );
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(distinctUntilChanged(), takeUntil(this.componentDestroy()))
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }
}
