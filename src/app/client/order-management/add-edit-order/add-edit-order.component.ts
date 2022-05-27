import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ItemModel, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { Store } from '@ngxs/store';

import { SetHeaderState } from 'src/app/store/app.actions';
import { SetImportFileDialogState } from '@admin/store/admin.actions';

@Component({
  selector: 'app-add-edit-order',
  templateUrl: './add-edit-order.component.html',
  styleUrls: ['./add-edit-order.component.scss']
})
export class AddEditOrderComponent {
  @ViewChild('stepper') tab: TabComponent;

  public title = 'Create';
  public submitMenuItems: ItemModel[] = [
    { text: 'Save For Later' },
    { text: 'Save as Template' }
  ];

  constructor(private store: Store, private router: Router) {
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  public navigateBack(): void {
    this.router.navigate(['/client/order-management']);
  }

  public onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }
}
