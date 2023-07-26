import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JobOrderComponent } from './job-order/job-order.component';

const routes: Routes = [
  {
    path: '',
    component: JobOrderComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowRoutingModule { }
