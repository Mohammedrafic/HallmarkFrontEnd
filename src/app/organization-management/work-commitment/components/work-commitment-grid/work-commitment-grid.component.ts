import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Store, Select, ofActionDispatched, Actions } from '@ngxs/store';
import { ColDef } from '@ag-grid-community/core';
import { filter, Observable, takeUntil } from 'rxjs';

import { GridReadyEventModel } from '@shared/components/grid/models';
import { GRID_CONFIG } from '@shared/constants';
import {
  WorkCommitmentFilters,
  WorkCommitmentGrid,
  WorkCommitmentsPage,
} from '../../interfaces/work-commitment-grid.interface';
import { WorkCommitmentColumnsDefinition } from '../../constants/work-commitment.constant';
import { WorkCommitmentState } from '../../../store/work-commitment.state';
import { WorkCommitment } from '../../../store/work-commitment.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { WorkCommitmentAdapter } from '../../adapters/work-commitment.adapter';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-work-commitment-grid',
  templateUrl: './work-commitment-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCommitmentGridComponent extends DestroyableDirective implements OnInit {
  @Output() editCommitment = new EventEmitter<WorkCommitmentGrid>();

  public filters: WorkCommitmentFilters = {
    pageNumber: GRID_CONFIG.initialPage,
    pageSize: GRID_CONFIG.initialRowsPerPage,
  };
  public columnDefinitions: ColDef[];
  public isLoading = false;
  public workCommitmentsGrid: WorkCommitmentGrid[];

  @Select(WorkCommitmentState.workCommitmentsPage)
  public workCommitmentsPage$: Observable<WorkCommitmentsPage>;

  @Select(UserState.lastSelectedOrganizationId)
  public organizationId$: Observable<number>;

  constructor(private store: Store, private actions$: Actions, private changeDetection: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.setColumnDefinition();
    this.watchForOrgChange();
    this.watchForUpdatePage();
    this.watchForWorkCommitments();
  }

  public sortByColumn(order: string): void {
    this.filters.orderBy = order;
    this.getNewPage();
  }

  public handleChangePage(pageNumber: number): void {
    if (pageNumber && this.filters.pageNumber !== pageNumber) {
      this.filters.pageNumber = pageNumber;
      this.getNewPage();
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if (pageSize) {
      this.filters.pageSize = pageSize;
      this.getNewPage();
    }
  }

  public gridReady(grid: GridReadyEventModel): void {
    grid.api.sizeColumnsToFit();
  }

  private watchForOrgChange(): void {
    this.organizationId$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.getNewPage();
    });
  }

  private setColumnDefinition(): void {
    this.columnDefinitions = WorkCommitmentColumnsDefinition((commitment: WorkCommitmentGrid) => {
      this.editCommitment.emit(commitment);
    });
  }

  private getNewPage(): void {
    this.store.dispatch(new WorkCommitment.GetCommitmentsByPage(this.filters));
  }

  private watchForUpdatePage(): void {
    this.actions$
      .pipe(ofActionDispatched(WorkCommitment.UpdatePageAfterSuccessAction), takeUntil(this.destroy$))
      .subscribe(() => {
        this.getNewPage();
      });
  }

  private watchForWorkCommitments(): void {
    this.workCommitmentsPage$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((commitmentsPage) => {
      this.workCommitmentsGrid = WorkCommitmentAdapter.adaptToGrid(commitmentsPage.items);
      this.changeDetection.markForCheck();
    });
  }
}
