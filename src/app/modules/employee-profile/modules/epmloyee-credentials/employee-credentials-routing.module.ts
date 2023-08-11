import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  EmployeeCredentialsContainerComponent,
} from './containers/employee-credentials-container/employee-credentials-container.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeCredentialsContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeCredentialsRoutingModule { }
