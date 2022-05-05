import { Component } from '@angular/core';

import { Store } from '@ngxs/store';

import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-timesheets-content',
  templateUrl: './timesheets-content.component.html',
  styleUrls: ['./timesheets-content.component.scss']
})
export class TimesheetsContentComponent  {

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Timesheets', iconName: 'clock' }));
  }
}
