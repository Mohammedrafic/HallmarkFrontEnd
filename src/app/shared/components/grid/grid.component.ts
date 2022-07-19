import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColumnState, Module, SelectionChangedEvent, SortChangedEvent } from '@ag-grid-community/core';
import { BehaviorSubject, combineLatest, filter, takeUntil, delay } from 'rxjs';

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { GridReadyEventModel } from '@shared/components/grid/models/grid-ready-event.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GRID_CONFIG } from '@shared/constants';
import { RowNode } from '@ag-grid-community/core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GridComponent<Data> extends DestroyableDirective implements OnChanges, OnInit {
  @Input() public columnDefinitions: ColumnDefinitionModel[] | null;
  @Input() public currentPage: number = 1;
  @Input() public isLoading: boolean | null = false;
  @Input() public suppressRowClickSelection: boolean = false;
  @Input() public allowBulkSelection: boolean = false;
  @Input() public rowSelection: 'single' | 'multiple' = 'single';
  @Input() public pageSize: number = GRID_CONFIG.rowsPerPageDropDownObject[0].value;
  @Input() public rowData: Data[] | null | undefined;
  @Input() public totalRecordsCount: number = 1;

  @Input() set changeTableSelectedIndex(next: number | null) {
    if (next !== null) {
      this.gridInstance$.getValue()?.api.forEachNode((node) => {
        if (node.rowIndex === next) {
          node.setSelected(true);
          this.gridSelectedRow.emit(node);
        } else {
          node.setSelected(false);
        }
      });
    }
  };

  @Output() public gridReadyEmitter: EventEmitter<GridReadyEventModel> = new EventEmitter();
  @Output() public navigateToPageEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() public pageSizeChangeEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() public gridSelectedRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() public approveEmitter: EventEmitter<RowNode[]> = new EventEmitter<RowNode[]>();
  @Output() public exportEmitter: EventEmitter<RowNode[]> = new EventEmitter<RowNode[]>();
  @Output() public sortChanged: EventEmitter<string> = new EventEmitter<string>();

  public readonly defaultColumnDefinition: ColumnDefinitionModel = { minWidth: 100, resizable: true };
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public readonly modules: Module[] = [ClientSideRowModelModule];
  public selectedTableRows: RowNode[] = [];

  private readonly isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly gridInstance$: BehaviorSubject<GridReadyEventModel | null> =
    new BehaviorSubject<GridReadyEventModel | null>(null);

  public ngOnChanges(changes: SimpleChanges): void {
    changes['isLoading'] && this.isLoading$.next(!!this.isLoading);
  }

  public ngOnInit(): void {
    this.initLoadingStateChangesListener();
  }

  public handleGridReadyEvent(event: GridReadyEventModel): void {
    this.gridInstance$.next(event);
    this.gridReadyEmitter.emit(event);
  }

  public handleSelectionChanged(event: GridReadyEventModel): void {
    this.gridSelectedRow.emit(event);
  }

  public handleMultiSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedTableRows = event.api.getSelectedNodes();
  }

  public handleSortChanged(event: SortChangedEvent): void {
    const columnWithSort = event.columnApi.getColumnState().find(col => col.sort !== null);
    this.sortChanged.emit(columnWithSort ? `${columnWithSort.colId} ${columnWithSort.sort}` : undefined);
  }

  private initLoadingStateChangesListener(): void {
    combineLatest([this.gridInstance$, this.isLoading$])
      .pipe(
        filter(([gridInstance]: [GridReadyEventModel | null, boolean]) => !!gridInstance),
        delay(0), // https://github.com/ag-grid/ag-grid/issues/1665 issue fix
        takeUntil(this.destroy$)
      )
      .subscribe(([grid, isLoading]: [GridReadyEventModel | null, boolean]) => {
        isLoading ? grid?.api.showLoadingOverlay() : this.rowData?.length && grid?.api.hideOverlay();
      });
  }
}
