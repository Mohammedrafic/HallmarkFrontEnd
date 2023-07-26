import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxsModule } from '@ngxs/store';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { EmployeeComponent } from './employee.component';
import { EmployeeRoutingModule } from './employee-routing.module';
import { ScheduleModule } from '../modules/schedule/schedule.module';

@NgModule({
  declarations: [
    EmployeeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    EmployeeRoutingModule,
    ScheduleModule,
    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
    ]),
  ],
})
export class EmployeeModule { }
