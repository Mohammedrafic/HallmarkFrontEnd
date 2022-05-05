import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss']
})
export class DashboardContentComponent  {

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Dashboard', iconName: 'home' }));
  }
}
