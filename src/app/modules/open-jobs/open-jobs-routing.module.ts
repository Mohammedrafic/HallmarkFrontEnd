import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OpenJobContainerComponent } from './containers/open-job-container/open-job-container.component';

const routes: Routes = [
  {
    path: '',
    component: OpenJobContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenJobsRoutingModule {}
