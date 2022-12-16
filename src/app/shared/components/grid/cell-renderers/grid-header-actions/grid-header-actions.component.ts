import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GridApi, IHeaderParams, RowNode } from '@ag-grid-community/core';
import { IHeaderAngularComp } from '@ag-grid-community/angular';
import { takeUntil, timer } from 'rxjs';
import { Destroyable } from '@core/helpers';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-grid-header-actions',
  templateUrl: './grid-header-actions.component.html',
  styleUrls: ['./grid-header-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridHeaderActionsComponent extends Destroyable implements IHeaderAngularComp {
  public params: IHeaderParams | null = null;
  public expanded = false;
  public scaled = false;

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
  }

  public refresh(params: IHeaderParams): boolean {
    this.agInit(params);

    return true;
  }

  public toggleRowExpansion(event: MouseEvent): void {
    event.stopImmediatePropagation();

    if (this.scaled) {
      this.toggleRowHeight();
    }

    this.gridApi?.forEachNode( (node: RowNode) => node.expanded = !this.expanded);
    this.gridApi?.onGroupExpandedOrCollapsed();
    this.cdr.markForCheck();
    this.expanded = this.checkIfAnyRowExpanded();
  }

  public toggleRowHeight(): void {
    if (this.expanded) {
      this.toggleRowExpansion(new MouseEvent('click'));
    }

    this.scaled = !this.scaled;
    this.params?.context.componentParent.toggleRowHeight(this.scaled);

    timer(100).pipe(
      take(1),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.gridApi.resetRowHeights();
      this.cdr.detectChanges();
    });
  }

  private checkIfAnyRowExpanded(): boolean {
    const nodes: RowNode[] = [];

    this.gridApi?.forEachNode((node: RowNode) => nodes.push(node));
    return nodes.some((node: RowNode) => node.expanded);
  }
}
