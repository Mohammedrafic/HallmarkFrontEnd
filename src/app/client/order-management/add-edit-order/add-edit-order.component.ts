import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ItemModel, SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { Store } from '@ngxs/store';

import { Subject, takeUntil } from 'rxjs';

import { SetHeaderState } from 'src/app/store/app.actions';
import { SetImportFileDialogState } from '@admin/store/admin.actions';

enum SelectedTab {
  OrderDetails,
  Credentials
}

@Component({
  selector: 'app-add-edit-order',
  templateUrl: './add-edit-order.component.html',
  styleUrls: ['./add-edit-order.component.scss']
})
export class AddEditOrderComponent implements OnDestroy {
  @ViewChild('stepper') tab: TabComponent;

  public SelectedTab = SelectedTab;

  public title = 'Create';
  public submitMenuItems: ItemModel[] = [
    { text: 'Save For Later' },
    { text: 'Save as Template' }
  ];
  public selectedTab: SelectedTab = SelectedTab.OrderDetails;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private router: Router) {
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public navigateBack(): void {
    this.router.navigate(['/client/order-management']);
  }

  public onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  public onStepperCreated(): void {
    this.tab.selected.pipe(takeUntil(this.unsubscribe$)).subscribe((event: SelectEventArgs) => {
      this.selectedTab = event.selectedIndex;
    });
  }
}
