import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkCommitmentComponent } from './containers/work-commitment-container/work-commitment.component';

const routes: Routes = [
  {
    path: '',
    component: WorkCommitmentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkCommitmentRoutingModule { }
