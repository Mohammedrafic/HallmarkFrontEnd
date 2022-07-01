import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: ':type',
        loadChildren: () =>
          import('./report/report.module').then(
            (module: typeof import('./report/report.module')) => module.ReportModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
