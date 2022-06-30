import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TimesheetsContainerComponent } from './containers/timesheets-container/timesheets-container.component';

const routes: Routes = [
  {
    path: '',
    component: TimesheetsContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimesheetsRoutingModule {}
