import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { Sliders } from 'angular-feather/icons';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';

import { OpenJobContainerComponent } from './open-job-container.component';
import { OpenJobsRoutingModule } from '../../open-jobs-routing.module';
import { JobFiltersModule } from '../../components/job-filters/job-filters.module';
import { JobGridModule } from '../../components/job-grid/job-grid.module';
import { EmployeeService } from '../../services';

@NgModule({
  declarations: [
    OpenJobContainerComponent,
  ],
  imports: [
    CommonModule,
    OpenJobsRoutingModule,
    JobFiltersModule,
    JobGridModule,
    ButtonAllModule,
    FeatherModule.pick({ Sliders }),
  ],
  providers: [EmployeeService],
})
export class OpenJobContainerModule {}
