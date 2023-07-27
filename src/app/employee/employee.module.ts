import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxsModule } from '@ngxs/store';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { EmployeeComponent } from './employee.component';
import { EmployeeRoutingModule } from './employee-routing.module';
import { ScheduleModule } from '../modules/schedule/schedule.module';
import { OpenJobsModule } from '../modules/open-jobs/open-jobs.module';
import { OpenJobResolver } from '../modules/open-jobs/resolvers/open-job.resolver';

@NgModule({
  declarations: [
    EmployeeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    EmployeeRoutingModule,
    ScheduleModule,
    OpenJobsModule,
    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
    ]),
  ],
  providers: [OpenJobResolver],
})
export class EmployeeModule { }
