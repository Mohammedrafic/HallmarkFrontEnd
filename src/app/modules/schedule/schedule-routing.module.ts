import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ScheduleContainerComponent } from './containers/schedule-container/schedule-container.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduleContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleRoutingModule {}
