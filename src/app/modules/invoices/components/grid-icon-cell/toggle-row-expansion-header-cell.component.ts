import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GridApi, IHeaderParams, RowNode } from '@ag-grid-community/core';
import { IHeaderAngularComp } from '@ag-grid-community/angular';
import { Destroyable } from '@core/helpers';
import { fromEvent, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-toggle-row-expansion-header-cell',
  templateUrl: './toggle-row-expansion-header-cell.component.html',
  styleUrls: ['./toggle-row-expansion-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleRowExpansionHeaderCellComponent extends Destroyable implements IHeaderAngularComp {
  public params: IHeaderParams | null = null;
  public expanded: boolean = false;
  public currentSort: 'asc' | 'desc' | null = null;
  public nextSort: 'asc' | 'desc' | null = 'asc';

  private skipCurComponent = false;
  private gridApi: GridApi;

  constructor(
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public agInit(params: IHeaderParams): void {
    this.params = params;
    this.gridApi = params.api;

    this.expanded = this.checkIfAnyRowExpanded();

    this.startTableSortWatching();
  }

  public refresh(params: IHeaderParams): boolean {
    this.agInit(params);

    return true;
  }

  public toggleRowExpansion(event: MouseEvent): void {
    event.stopImmediatePropagation();

    this.gridApi?.forEachNode( (node: RowNode) => node.expanded = !this.expanded);
    this.gridApi?.onGroupExpandedOrCollapsed();
    this.cdr.markForCheck();
    this.expanded = this.checkIfAnyRowExpanded();
  }

  public onSortRequested(order: 'asc' | 'desc' | null, event: { shiftKey: boolean }): void {
    this.skipCurComponent = true;
    this.params?.setSort(order, event.shiftKey);
    this.sortChanged();
  }

  private checkIfAnyRowExpanded(): boolean {
    let nodes: RowNode[] = [];

    this.gridApi?.forEachNode((node: RowNode) => nodes.push(node));
    return nodes.some((node: RowNode) => node.expanded);
  }

  private startTableSortWatching(): void {
    fromEvent(this.params?.api as any, 'sortChanged').pipe(
      tap(() => this.skipCurComponent ? null : this.resetSort()),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.skipCurComponent = false;
    });
  }

  private resetSort(): void {
    this.currentSort = null;
    this.nextSort = 'asc';
    this.cdr.markForCheck();
  }

  private sortChanged(): void {
    if (this.params?.column.isSortAscending()) {
      this.currentSort = 'asc';
      this.nextSort = 'desc';

      return;
    }

    if (this.params?.column.isSortDescending()) {
      this.currentSort = 'desc';
      this.nextSort = null;

      return;
    }

    this.currentSort = null;
    this.nextSort = 'asc';
  }
}
