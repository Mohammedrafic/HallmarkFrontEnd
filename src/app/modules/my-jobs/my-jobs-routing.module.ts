import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MyJobsContainerComponent } from './containers/my-jobs-container/my-jobs-container.component';
import { MyJobsResolver } from './resolvers/my-jobs.resolver';

const routes: Routes = [
  {
    path: '',
    component: MyJobsContainerComponent,
    resolve: {
      preservedFilters: MyJobsResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyJobsRoutingModule {}
