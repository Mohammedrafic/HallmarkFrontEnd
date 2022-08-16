import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridCellLinkParams, GridCellRenderer } from '../../models';

@Component({
  selector: 'app-grid-cell-link',
  templateUrl: './grid-cell-link.component.html',
  styleUrls: ['./grid-cell-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridCellLinkComponent extends GridCellRenderer<GridCellLinkParams> {
}
