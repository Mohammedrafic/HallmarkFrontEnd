import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeatureFlagResolverService } from '@core/resolvers';
import { AdminGuard, AgencyGuard, EmployeeGuard, OrganizationGuard, RoleGuard } from '@core/guards';
import { ShellPageComponent } from './shell.component';
import { AllBusinessTypeRoles } from '@shell/shell.constant';

const shellRoutes: Routes = [
  {
    path: '',
    component: ShellPageComponent,
    resolve: [FeatureFlagResolverService],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('../admin/admin.module').then((m) => m.AdminModule),
        canActivate: [AdminGuard],
      },
      {
        path: 'client',
        loadChildren: () => import('../client/client.module').then((m) => m.ClientModule),
        canActivate: [OrganizationGuard],
      },
      {
        path: 'agency',
        loadChildren: () => import('../agency/agency.module').then((m) => m.AgencyModule),
        canActivate: [AgencyGuard],
      },
      {
        path: 'security',
        loadChildren: () => import('../security/security.module').then((m) => m.SecurityModule),
        canActivate: [RoleGuard],
        canLoad: [RoleGuard],
        data: { roles: AllBusinessTypeRoles },
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../reports/reports.module').then((m: typeof import('../reports/reports.module')) => m.ReportsModule),
        canActivate: [RoleGuard],
        canLoad: [RoleGuard],
        data: {
          isOrganizationArea: true,
          roles: AllBusinessTypeRoles,
        },
      },
      {
        path: 'analytics',
        loadChildren: () => import('../admin/analytics/analytics.module').then((m) => m.AnalyticsModule),
        canActivate: [RoleGuard],
        canLoad: [RoleGuard],
        data: { roles: AllBusinessTypeRoles },
      },
      {
        path: 'alerts',
        loadChildren: () => import('../admin/alerts/alerts.module').then((m) => m.AlertsModule),
        canActivate: [RoleGuard],
        canLoad: [RoleGuard],
        data: { roles: AllBusinessTypeRoles },
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('../modules/document-library/document-library.module').then((m) => m.DocumentLibraryModule),
        canActivate: [RoleGuard],
        canLoad: [RoleGuard],
        data: { roles: AllBusinessTypeRoles },
      },
      {
        path: 'reporting',
        loadChildren: () =>
          import('../modules/logi-custom-report/logi-custom-report.module').then((m) => m.LogiCustomReportModule),
        canActivate: [RoleGuard],
        canLoad: [RoleGuard],
        data: {
          isOrganizationArea: true,
          roles: AllBusinessTypeRoles,
        },
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
