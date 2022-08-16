import { Component } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GridActionsCellConfig, GridActionsCellItem } from '../../interfaces';

@Component({
  selector: 'app-grid-actions-cell',
  templateUrl: './grid-actions-cell.component.html',
  styleUrls: ['./grid-actions-cell.component.scss']
})
export class GridActionsCellComponent extends GridCellRenderer<GridActionsCellConfig & ICellRendererParams> {
  public actionsConfig: GridActionsCellItem[];
  public data: unknown;

  public override agInit(params: GridActionsCellConfig & ICellRendererParams) {
    super.agInit(params);

    this.actionsConfig = params.actionsConfig;
    this.data = params.data;
  }

  public trackBy(_: number, item: GridActionsCellItem) {
    return item.title || item.iconName;
  }
}
