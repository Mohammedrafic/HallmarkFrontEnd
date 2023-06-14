import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ColDef, RowDragEvent } from "@ag-grid-community/core";
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, takeUntil } from 'rxjs';

import { Tiers } from '@organization-management/store/tiers.actions';
import { TiersState } from '@organization-management/store/tiers.state';
import { TierFilters } from '@organization-management/tiers/interfaces';
import { TiersColumnsDefinition, TiersColumnsDefinitionIRP } from "@organization-management/tiers/tiers-grid/tiers-grid.constant";
import { GridReadyEventModel } from '@shared/components/grid/models';
import { TierDetails, TiersPage } from '@shared/components/tiers-dialog/interfaces';
import { GRID_CONFIG } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { SystemType } from "@shared/enums/system-type.enum";

@Component({
  selector: 'app-tiers-grid',
  templateUrl: './tiers-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiersGridComponent extends DestroyableDirective implements OnInit {
  @Input() systemType: SystemType;

  @Output() editTier = new EventEmitter<TierDetails>();

  public columnDefinitions: ColDef[];
  public isLoading = false;
  public filters: TierFilters = {
    pageNumber: GRID_CONFIG.initialPage,
    pageSize: GRID_CONFIG.initialRowsPerPage,
  };

  @Select(TiersState.tiersPage)
  public tiersPage$: Observable<TiersPage>;

  constructor(
    private store: Store,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setColumnDefinition();
    this.watchForUpdatePage();
  }

  ngOnChanges(): void {
    this.setColumnDefinition();
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
      pageSize: this.filters.pageSize,
      systemType: this.systemType,
    }));
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.filters.pageNumber !== pageNumber) {
      this.filters.pageNumber = pageNumber;
      this.getNewPage(this.systemType);
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if(pageSize) {
      this.filters.pageSize = pageSize;
      this.getNewPage(this.systemType);
    }
  }

  public getNewPage(systemType: SystemType): void {
    this.store.dispatch(new Tiers.GetTiersByPage(this.filters.pageNumber, this.filters.pageSize, systemType));
  }

  public setColumnDefinition(): void {
    if(this.systemType == 0){
      this.columnDefinitions = TiersColumnsDefinition((tier: TierDetails) => {
        this.editTier.emit(tier);
      });
    } else {
      this.columnDefinitions = TiersColumnsDefinitionIRP((tier: TierDetails) => {
        this.editTier.emit(tier);
      });
    }
    
  }

  private watchForUpdatePage(): void {
    this.actions$.pipe(
      ofActionDispatched(Tiers.UpdatePageAfterSuccessAction),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.getNewPage(this.systemType);
    });
  }
}
