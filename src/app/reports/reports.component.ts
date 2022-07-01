import { Store } from '@ngxs/store';

import { Component, ChangeDetectionStrategy } from '@angular/core';

import { SetHeaderState } from '../store/app.actions';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  public readonly reportsList = [
    { text: 'Candidates', id: 1, route: './candidates' },
    { text: 'Fill rates', id: 2, route: './fillRates' },
  ];

  public constructor(private readonly store: Store) {
    this.setHeader();
  }

  private setHeader(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'trello' }));
  }
}
