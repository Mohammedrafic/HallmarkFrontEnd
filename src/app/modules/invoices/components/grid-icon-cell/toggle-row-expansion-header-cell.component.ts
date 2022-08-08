import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { GridApi, ICellRendererParams, RowNode } from '@ag-grid-community/core';

@Component({
  selector: 'app-toggle-row-expansion-header-cell',
  templateUrl: './toggle-row-expansion-header-cell.component.html',
  styleUrls: ['./toggle-row-expansion-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleRowExpansionHeaderCellComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams | null = null;
  public expanded: boolean = false;

  private gridApi: GridApi;

  public agInit(params: ICellRendererParams): void {
    this.params = params;
    this.expanded = this.checkIfAnyRowExpanded();
    this.gridApi = params.api;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.agInit(params);

    return true;
  }

  public toggleRowExpansion(): void {
    this.gridApi?.forEachNode( (node: RowNode) => node.expanded = !this.expanded);
    this.gridApi?.onGroupExpandedOrCollapsed();
    this.expanded = this.checkIfAnyRowExpanded();
  }

  private checkIfAnyRowExpanded(): boolean {
    let nodes: RowNode[] = [];

    this.gridApi?.forEachNode((node: RowNode) => nodes.push(node));
    return nodes.some((node: RowNode) => node.expanded);
  }
}
