import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OpenJobContainerModule } from './containers/open-job-container/open-job-container.module';
import { JobFiltersModule } from './components/job-filters/job-filters.module';
import { JobGridModule } from './components/job-grid/job-grid.module';
import { JobFilterService, OpenJobApiService } from './services';

@NgModule({
  imports: [
    CommonModule,
    OpenJobContainerModule,
    JobFiltersModule,
    JobGridModule,
  ],
  providers: [OpenJobApiService, JobFilterService],
})
export class OpenJobsModule { }
