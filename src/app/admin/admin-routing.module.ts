import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../shared/guards/unsaved-chages.guard';

import { AdminComponent } from './admin.component';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { MasterDataContentComponent } from './master-data/master-data-content.component';
import { SkillsCategoriesComponent } from './master-data/skills/skills-categories.component';
import {
  MasterCredentialsTypesComponent
} from './master-data/master-credentials/master-credentials-types/master-credentials-types.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MasterHolidaysComponent } from './master-data/holidays/holidays.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
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
        path: 'master-data',
        component: MasterDataContentComponent,
        children: [
          {
            path: 'skills',
            component: SkillsCategoriesComponent
          },
          {
            path: 'credential-types',
            component: MasterCredentialsTypesComponent
          },
          {
            path: 'holidays',
            component: MasterHolidaysComponent
          }
        ]
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
