import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EmployeeComponent } from './employee.component';

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
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class EmployeeRoutingModule {}
