import { Select, Store } from '@ngxs/store';

import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { SetHeaderState } from '../store/app.actions';
import { UserState } from '../store/user.state';
import { Observable, takeUntil } from 'rxjs';
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent extends DestroyableDirective implements OnInit{
  @Select(UserState.user)
  user$: Observable<User>;

  public isAgency = false;

  public readonly reportsList = [
    { text: 'Candidates', id: 1, route: './candidates' },
    { text: 'Fill rates', id: 2, route: './fillRates' },
  ];

  public constructor(private readonly store: Store) {
    super();
    this.setHeader();
  }

  ngOnInit(): void {
    // TODO: Remove it after reports for agency will be done;
    this.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user) => {
      if (user.businessUnitType  === BusinessUnitType.Agency) {
        this.isAgency = true;
      }
    })
  }

  private setHeader(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'trello' }));
  }
}
