import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../shared/guards/unsaved-chages.guard';

import { AdminComponent } from './admin.component';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import {
  OrganizationManagementContentComponent
} from './organization-management/organization-management-content/organization-management-content.component';
import { LocationsComponent } from './organization-management/organization-management-content/locations/locations.component';
import {
  DepartmentsComponent
} from './organization-management/organization-management-content/departments/departments.component';
import { CredentialsComponent } from './organization-management/organization-management-content/credentials/credentials.component';
import { MasterDataContentComponent } from './master-data/master-data-content.component';
import { SkillsCategoriesComponent } from './master-data/skills/skills-categories.component';
import { SkillsComponent } from './organization-management/organization-management-content/skills/skills.component';
import { MasterCredentialsComponent } from './master-data/master-credentials/master-credentials.component';
import { DashboardComponent } from './dashboard/dashboard.component';

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
        component: OrganizationManagementContentComponent,
        children: [
          {
            path: 'departments',
            component: DepartmentsComponent
          },
          {
            path: 'locations',
            component: LocationsComponent
          },
          {
            path: 'credentials',
            component: CredentialsComponent
          },
          {
            path: 'skills',
            component: SkillsComponent
          }
        ]
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
            component: MasterCredentialsComponent
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
