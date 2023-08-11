import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmployeeCredentialsRoute, ProfileInformationRoute } from './constants';
import { EmployeeProfileComponent } from './employee-profile.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeProfileComponent,
    children: [
      {
        path: ProfileInformationRoute,
        loadChildren: () => import('./modules/profile-information/profile-information.module')
          .then((m) => m.ProfileInformationModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: EmployeeCredentialsRoute,
        loadChildren: () => import('./modules/epmloyee-credentials/employee-credentials.module')
          .then((m) => m.EmployeeCredentialsModule),
        data: {
          isOrganizationArea: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeProfileRoutingModule { }
