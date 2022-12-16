import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { GridRowDetailsCellRenderer } from '@shared/components/grid/models';
import { IDetailCellRendererParams } from '@ag-grid-community/core';
import { TakeUntilDestroy } from '@core/decorators';
import { Observable, takeUntil, throttleTime } from 'rxjs';

@TakeUntilDestroy
@Component({
  selector: 'app-table-row-detail',
  templateUrl: './table-row-detail.component.html',
  styleUrls: ['./table-row-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowDetailComponent<T>
  extends GridRowDetailsCellRenderer<T>
  implements ICellRendererAngularComp, OnDestroy {
  protected componentDestroy: () => Observable<unknown>;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  public override agInit(params: IDetailCellRendererParams): void {
    super.agInit(params);

    this.startRowDataWatching();
  }

  public selectRow(childRow: T): void  {
    // TODO implement position select
  }

  private startRowDataWatching(): void {
    this.rowDataSubj.getStream().pipe(
      throttleTime(200),
      takeUntil(this.componentDestroy()),
    ).subscribe((data) => {
      this.colDefs = this.params.detailGridOptions.columnDefs || [];
      this.rowData = data;

      this.cdr.detectChanges();
    });
  }
}
