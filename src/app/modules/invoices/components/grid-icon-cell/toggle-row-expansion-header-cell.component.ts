import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GridApi, IHeaderParams, RowNode } from '@ag-grid-community/core';
import { IHeaderAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-toggle-row-expansion-header-cell',
  templateUrl: './toggle-row-expansion-header-cell.component.html',
  styleUrls: ['./toggle-row-expansion-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleRowExpansionHeaderCellComponent implements IHeaderAngularComp {
  public params: IHeaderParams | null = null;
  public expanded: boolean = false;

  private gridApi: GridApi;

  constructor(
    private readonly cdr: ChangeDetectorRef,
  ) {
  }

  public agInit(params: IHeaderParams): void {
    this.params = params;
    this.gridApi = params.api;

    this.expanded = this.checkIfAnyRowExpanded();
  }

  public refresh(params: IHeaderParams): boolean {
    this.agInit(params);

    return true;
  }

  public toggleRowExpansion(): void {
    this.gridApi?.forEachNode( (node: RowNode) => node.expanded = !this.expanded);
    this.gridApi?.onGroupExpandedOrCollapsed();
    this.cdr.markForCheck();
    this.expanded = this.checkIfAnyRowExpanded();
  }

  private checkIfAnyRowExpanded(): boolean {
    let nodes: RowNode[] = [];

    this.gridApi?.forEachNode((node: RowNode) => nodes.push(node));
    return nodes.some((node: RowNode) => node.expanded);
  }
}
