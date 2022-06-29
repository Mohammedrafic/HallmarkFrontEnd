import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellPageComponent } from './shell.component';

const shellRoutes: Routes = [
  {
    path: '',
    component: ShellPageComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () => import('../admin/admin.module').then((m) => m.AdminModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'client',
        loadChildren: () => import('../client/client.module').then((m) => m.ClientModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'agency',
        loadChildren: () => import('../agency/agency.module').then((m) => m.AgencyModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'security',
        loadChildren: () => import('../security/security.module').then((m) => m.SecurityModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../reports/reports.module').then((m: typeof import('../reports/reports.module')) => m.ReportsModule),
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(shellRoutes)],
  exports: [RouterModule],
})
export class ShellRoutingModule {}
