import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-reports-content',
  templateUrl: './reports-content.component.html',
})
export class ReportsContentComponent  {

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'clipboard' }));
  }
}
