import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseExportComponent } from './components/base-export/base-export.component';

const routes: Routes = [
  {
    path: '',
    component: BaseExportComponent,
    data: { skipAuthentication: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleExportRoutingModule {}
