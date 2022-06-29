import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { Module } from '@ag-grid-community/core';
import { BehaviorSubject, combineLatest, filter, takeUntil } from 'rxjs';

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
  @Input() public pageSize: number = GRID_CONFIG.rowsPerPageDropDownObject[0].value;
  @Input() public rowData: Data[] | null | undefined;
  @Input() public totalRecordsCount: number = 1;

  @Output() public gridReadyEmitter: EventEmitter<GridReadyEventModel> = new EventEmitter();
  @Output() public navigateToPageEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() public pageSizeChangeEmitter: EventEmitter<number> = new EventEmitter<number>();

  public readonly defaultColumnDefinition: ColumnDefinitionModel = { minWidth: 100, resizable: true, flex: 1 };
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public readonly modules: Module[] = [ClientSideRowModelModule];

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

  private initLoadingStateChangesListener(): void {
    combineLatest([this.gridInstance$, this.isLoading$])
      .pipe(
        filter(([gridInstance]: [GridReadyEventModel | null, boolean]) => !!gridInstance),
        takeUntil(this.destroy$)
      )
      .subscribe(([grid, isLoading]: [GridReadyEventModel | null, boolean]) => {
        isLoading ? grid?.api.showLoadingOverlay() : grid?.api.hideOverlay();
      });
  }
}
