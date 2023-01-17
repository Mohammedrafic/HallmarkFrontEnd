import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';

@Component({
  selector: 'app-orientation-completed',
  templateUrl: './orientation-completed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrientationCompletedComponent extends GridCellRenderer {
  public constructor() {
    super();
  }
}
