import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsavedChangesGuard } from '@shared/guards';

import { AdminComponent } from './admin.component';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { MasterDataContentComponent } from './master-data/master-data-content.component';
import { SkillsCategoriesComponent } from './master-data/skills/skills-categories.component';
import {
  MasterCredentialsTypesComponent
} from './master-data/master-credentials/master-credentials-types/master-credentials-types.component';
import { MasterHolidaysComponent } from './master-data/holidays/holidays.component';
import { RejectReasonMasterComponent } from "@admin/master-data/reject-reason-master/reject-reason-master.component";
import { ManualInvoiceReasonsComponent } from '@admin/master-data/manual-invoice-reasons/manual-invoice-reasons.component';
import { OrganizationProfileComponent } from './organization-profile/organization-profile.component';

import { AlertsComponent } from './alerts/alerts.component';
import { MasterCredentialsComponent } from './master-data/master-credentials/master-credentials.component';
import { CredentialsListComponent } from '@shared/components/credentials-list/credentials-list.component';
import { CommitmentComponent } from './master-data/commitment/commitment.component';
import { OrgInterfaceComponent } from './org-interface/org-interface.component';
import { LogInterfaceComponent } from './log-interface/log-interface.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then((mod) => mod.DashboardModule),
      },
      {
        path: 'client-management',
        component: ClientManagementContentComponent,
      },
      {
        path: 'client-management/add',
        component: AddEditOrganizationComponent,
        data: { isEditing: false },
        canDeactivate: [UnsavedChangesGuard]
      },
      {
        path: 'client-management/edit/:organizationId',
        component: AddEditOrganizationComponent,
        data: { isEditing: true },
        canDeactivate: [UnsavedChangesGuard]
      },
      {
        path: 'organization-management',
        loadChildren: () =>
          import('../organization-management/organization-management.module').then((m) => m.OrganizationManagementModule),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'orginterfaces',
        component : OrgInterfaceComponent
      },
      {
        path: 'loginterfaces',
        component : LogInterfaceComponent
      },
      {
        path: 'master-data',
        component: MasterDataContentComponent,
        children: [
          {
            path: 'skills',
            component: SkillsCategoriesComponent
          },
          {
            path: 'credentials',
            component: MasterCredentialsComponent,
            children: [
              {
                path: 'list',
                component: CredentialsListComponent,
                data: { canEdit: true },
              },
              {
                path: 'types',
                component: MasterCredentialsTypesComponent
              }
            ]
          },
          {
            path: 'holidays',
            component: MasterHolidaysComponent
          },
          {
            path: 'reject-reason',
            component: RejectReasonMasterComponent
          },
          {
            path: 'manual-invoice-reasons',
            component: ManualInvoiceReasonsComponent
          },
          {
            path: 'commitment',
            component: CommitmentComponent
          }
        ]
      },
      {
        path: 'timesheets',
        loadChildren: () => import('../modules/timesheets/timesheets.module').then((m) => m.TimesheetsModule),
      },
      {
        path: 'invoices',
        loadChildren: () => import('../modules/invoices/invoices.module').then((m) => m.InvoicesModule),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./analytics/analytics.module').then((m) => m.AnalyticsModule),
      },
      {
        path: ':profile',
        component: OrganizationProfileComponent,
        data: {
          isOrganizationArea: true,
        },
        canDeactivate: [UnsavedChangesGuard]
      },
      {
        path: 'alerts',
        component: AlertsComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
