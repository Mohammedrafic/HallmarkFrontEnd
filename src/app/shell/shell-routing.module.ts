import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeatureFlagResolverService } from '@core/resolvers';
import { ShellPageComponent } from './shell.component';
import { EmployeeGuard, UserLicenceGuard } from '@core/guards';

const shellRoutes: Routes = [
  {
    path: '',
    component: ShellPageComponent,
    resolve: [FeatureFlagResolverService],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('../admin/admin.module').then((m) => m.AdminModule),
        canActivate: [UserLicenceGuard],
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'client',
        loadChildren: () => import('../client/client.module').then((m) => m.ClientModule),
        canActivate: [UserLicenceGuard],
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'agency',
        loadChildren: () => import('../agency/agency.module').then((m) => m.AgencyModule),
        canActivate: [UserLicenceGuard],
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'security',
        loadChildren: () => import('../security/security.module').then((m) => m.SecurityModule),
        canActivate: [UserLicenceGuard],
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../reports/reports.module').then((m: typeof import('../reports/reports.module')) => m.ReportsModule),
        data: { isOrganizationArea: true },
        canActivate: [UserLicenceGuard],
      },
      {
        path: 'analytics',
        loadChildren: () => import('../admin/analytics/analytics.module').then((m) => m.AnalyticsModule),
        canActivate: [UserLicenceGuard],
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'alerts',
        loadChildren: () => import('../admin/alerts/alerts.module').then((m) => m.AlertsModule),
        canActivate: [UserLicenceGuard],
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('../modules/document-library/document-library.module').then((m) => m.DocumentLibraryModule),
        canActivate: [UserLicenceGuard],
      }
      ,
      {
        path: 'reporting',
        loadChildren: () =>
          import('../modules/logi-custom-report/logi-custom-report.module').then((m) => m.LogiCustomReportModule),
        data: { isOrganizationArea: true },
        canActivate: [UserLicenceGuard],
      },
      {
        path: 'employee',
        loadChildren: () => import('../employee/employee.module').then((m) => m.EmployeeModule),
        canActivate: [EmployeeGuard],
        canLoad: [EmployeeGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(shellRoutes)],
  exports: [RouterModule],
})
export class ShellRoutingModule {}
