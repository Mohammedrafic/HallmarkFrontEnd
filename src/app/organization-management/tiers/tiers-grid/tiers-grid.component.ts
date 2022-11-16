import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ColDef, RowDragEvent } from "@ag-grid-community/core";

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store'
import { Observable, takeUntil } from 'rxjs';

import { TiersColumnsDefinition } from "@organization-management/tiers/tiers-grid/tiers-grid.constant";
import { Tiers } from '@organization-management/store/tiers.actions';
import { TiersState } from '@organization-management/store/tiers.state';
import { TierFilters } from '@organization-management/tiers/interfaces';
import { GridReadyEventModel } from '@shared/components/grid/models';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { TierDetails, TiersPage } from '@shared/components/tiers-dialog/interfaces';
import { GRID_CONFIG } from '@shared/constants';

@Component({
  selector: 'app-tiers-grid',
  templateUrl: './tiers-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiersGridComponent extends DestroyableDirective implements OnInit {
  @Select(TiersState.tiersPage)
  public tiersPage$: Observable<TiersPage>;

  @Output() editTier = new EventEmitter<TierDetails>();

  public columnDefinitions: ColDef[];
  public isLoading: boolean = false;
  public filters: TierFilters = {
    pageNumber: GRID_CONFIG.initialPage,
    pageSize: GRID_CONFIG.initialRowsPerPage
  }

  constructor(
    private store: Store,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setColumnDefinition();
    this.getNewPage();
    this.watchForUpdatePage();
  }

  public gridReady(grid: GridReadyEventModel): void {
    grid.api.sizeColumnsToFit();
  }

  public rowDragEnd(event: RowDragEvent): void {
    this.store.dispatch(new Tiers.ChangeTierPriority({
      organizationTierId: event.node.data.id,
      priority: ++event.node.rowIndex!,
      orderBy: null,
      pageNumber: this.filters.pageNumber,
      pageSize: this.filters.pageSize
    }));
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.filters.pageNumber !== pageNumber) {
      this.filters.pageNumber = pageNumber;
      this.getNewPage();
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if(pageSize) {
      this.filters.pageSize = pageSize;
      this.getNewPage();
    }
  }

  private getNewPage(): void {
    this.store.dispatch(new Tiers.GetTiersByPage(this.filters.pageNumber, this.filters.pageSize));
  }

  setColumnDefinition(): void {
    this.columnDefinitions = TiersColumnsDefinition((tier: TierDetails) => {
      this.editTier.emit(tier);
    });
  }

  private watchForUpdatePage(): void {
    this.actions$.pipe(
      ofActionDispatched(Tiers.UpdatePageAfterSuccessAction),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.getNewPage();
    });
  }
}
