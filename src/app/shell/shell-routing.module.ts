import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeatureFlagResolverService } from '@core/resolvers';
import { ShellPageComponent } from './shell.component';

const shellRoutes: Routes = [
  {
    path: '',
    component: ShellPageComponent,
    resolve: [FeatureFlagResolverService],
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
        data: { isOrganizationArea: true },
      },
      {
        path: 'analytics',
        loadChildren: () => import('../admin/analytics/analytics.module').then((m) => m.AnalyticsModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'alerts',
        loadChildren: () => import('../admin/alerts/alerts.module').then((m) => m.AlertsModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('../modules/document-library/document-library.module').then((m) => m.DocumentLibraryModule)
      }
      ,
      {
        path: 'reporting',
        loadChildren: () =>
          import('../modules/logi-custom-report/logi-custom-report.module').then((m) => m.LogiCustomReportModule),
        data: { isOrganizationArea: true },
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(shellRoutes)],
  exports: [RouterModule],
})
export class ShellRoutingModule {}
