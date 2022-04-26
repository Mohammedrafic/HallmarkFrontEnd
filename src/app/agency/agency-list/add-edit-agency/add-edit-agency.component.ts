import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';

import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-add-edit-agency',
  templateUrl: './add-edit-agency.component.html',
  styleUrls: ['./add-edit-agency.component.scss'],
})
export class AddEditAgencyComponent {
  @ViewChild('accordion') accordion: AccordionComponent;

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Agency' }));
  }

  public acrdnCreated(): void {
    // this.accordion.enableItem(1, false);
   }
}
