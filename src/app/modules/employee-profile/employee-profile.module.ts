import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeProfileComponent } from './employee-profile.component';
import { EmployeeProfileRoutingModule } from './employee-profile-routing.module';

@NgModule({
  declarations: [EmployeeProfileComponent],
  imports: [
    CommonModule,
    EmployeeProfileRoutingModule,
  ],
})
export class EmployeeProfileModule { }
