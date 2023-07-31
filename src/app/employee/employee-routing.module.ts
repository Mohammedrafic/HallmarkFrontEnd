import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EmployeeComponent } from './employee.component';
import { OpenJobResolver } from '../modules/open-jobs/resolvers/open-job.resolver';

const routes: Routes = [
  { path: '', redirectTo: 'scheduling', pathMatch: 'full' },
  {
    path: '',
    component: EmployeeComponent,
    children: [
      {
        path: 'scheduling',
        loadChildren: () => import('../modules/schedule/schedule.module').then((m) => m.ScheduleModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'open-jobs',
        loadChildren: () => import('../modules/open-jobs/open-jobs.module').then((m) => m.OpenJobsModule),
        resolve: {
          preservedFilters: OpenJobResolver,
        },
        data: {
          isOrganizationArea: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
