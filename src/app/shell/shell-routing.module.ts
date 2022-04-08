import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellPageComponent } from './shell-page.component';

const shellRoutes: Routes = [
  {
    path: '',
    component: ShellPageComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('../admin/admin.module').then((m) => m.AdminModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'client',
        loadChildren: () =>
          import('../client/client.module').then((m) => m.ClientModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'agency',
        loadChildren: () =>
          import('../agency/agency.module').then((m) => m.AgencyModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(shellRoutes)],
  exports: [RouterModule],
})
export class ShellRoutingModule {}
