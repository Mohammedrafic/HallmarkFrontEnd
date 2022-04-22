import { Component } from '@angular/core';
import { Store } from '@ngxs/store';

import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-add-edit-agency',
  templateUrl: './add-edit-agency.component.html',
  styleUrls: ['./add-edit-agency.component.scss'],
})
export class AddEditAgencyComponent {
  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Agency' }));
  }
}
