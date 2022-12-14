import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { GridRowDetailsCellRenderer } from '@shared/components/grid/models';

@Component({
  selector: 'app-table-row-details',
  templateUrl: './table-row-details.component.html',
  styleUrls: ['./table-row-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowDetailsComponent<T>
  extends GridRowDetailsCellRenderer<T>
  implements ICellRendererAngularComp, OnDestroy {
  public gridReady(): void {
    this.addDetailsGridInfo();
  }
}
