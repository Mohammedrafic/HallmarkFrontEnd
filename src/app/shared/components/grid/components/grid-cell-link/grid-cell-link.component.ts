import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { GridCellLinkParams } from '../../models';

@Component({
  selector: 'app-grid-cell-link',
  templateUrl: './grid-cell-link.component.html',
  styleUrls: ['./grid-cell-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridCellLinkComponent implements ICellRendererAngularComp {
  public params: GridCellLinkParams | null = null;
  public value: string | number | null = null;

  public agInit(params: GridCellLinkParams): void {
    this.params = params;
    this.value = params.getValue?.();
  }

  public refresh(params: GridCellLinkParams): boolean {
    this.agInit(params);

    return true;
  }
}
