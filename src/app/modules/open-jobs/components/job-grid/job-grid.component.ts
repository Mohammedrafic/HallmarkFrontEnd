import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { takeUntil } from 'rxjs';
import { ColDef, SortChangedEvent } from '@ag-grid-community/core';

import { Destroyable } from '@core/helpers';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { OpenJob, OpenJobPage, PageSettings } from '../../interfaces';
import { JobGridConfig } from './contants';
import { JobPageSettings } from '../../constants';
import { EmployeeService, JobFilterService } from '../../services';

@Component({
  selector: 'app-job-grid',
  templateUrl: './job-grid.component.html',
  styleUrls: ['./job-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobGridComponent extends Destroyable {
  @Input() jobsPage: OpenJobPage;

  public openJobsPage: OpenJobPage;
  public gridDefs: ColDef[] = JobGridConfig;
  public pageSettings: PageSettings = JobPageSettings;

  public readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;
  public readonly context: { componentParent: JobGridComponent };

  constructor(
    private employeeService: EmployeeService,
    private jobFilterService: JobFilterService,
  ) {
    super();
    this.context = {
      componentParent: this,
    };
  }

  public applyEmployeeJob(job: OpenJob): void {
    //this method call from LikeActionComponent, to apply Employee job
    this.employeeService.applyEmployee(job).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe();
  }

  public handleSortChanged(event: SortChangedEvent): void {
    this.employeeService.sortEmployeeGrid(event);
  }

  public changePage(pageNumber: number): void {
    if (pageNumber === this.pageSettings.pageNumber) {
      return;
    }

    this.pageSettings.pageNumber = pageNumber;
    this.setPageSettings();
  }

  public changePageSize(pageSize: number): void {
    if (pageSize === this.pageSettings.pageSize) {
      return;
    }

    this.pageSettings.pageSize = pageSize;
    this.setPageSettings();
  }

  private setPageSettings(): void {
    this.jobFilterService.setFilters(this.pageSettings);
  }
}
