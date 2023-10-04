import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ColDef, SortChangedEvent } from '@ag-grid-community/core';

import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { OpenJobPage } from '@shared/models';

import { MyJobsGridConfig } from './contants/my-jobs-grid.constant';
import { MyJobsFilterService } from '../../services/my-jobs-filter.service';
import { MyJobsService } from '../../services/my-jobs.service';
import { MyJobsPageSettings } from '../../constants';
import { PageSettings } from '../../interfaces';

@Component({
  selector: 'app-my-jobs-grid',
  templateUrl: './my-jobs-grid.component.html',
  styleUrls: ['./my-jobs-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyJobsGridComponent {
  @Input() jobsPage: OpenJobPage;

  gridDefs: ColDef[] = MyJobsGridConfig;
  pageSettings: PageSettings = MyJobsPageSettings;

  readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;

  constructor(
    private myJobsService: MyJobsService,
    private filterService: MyJobsFilterService,
  ) {}

  handleSortChanged(event: SortChangedEvent): void {
    this.myJobsService.sortMyJobsGrid(event);
  }

  changePage(pageNumber: number): void {
    if (pageNumber === this.pageSettings.pageNumber) {
      return;
    }

    this.pageSettings.pageNumber = pageNumber;
    this.setPageSettings();
  }

  changePageSize(pageSize: number): void {
    if (pageSize === this.pageSettings.pageSize) {
      return;
    }

    this.pageSettings.pageSize = pageSize;
    this.setPageSettings();
  }

  private setPageSettings(): void {
    this.filterService.setFilters(this.pageSettings);
  }
}
