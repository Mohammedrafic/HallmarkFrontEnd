import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../shared/guards/unsaved-chages.guard';

import { AdminComponent } from './admin.component';
import { AddEditOrganizationComponent } from './client-management/add-edit-organization/add-edit-organization.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: ClientManagementContentComponent,
      },
      {
        path: 'client-management',
        component: ClientManagementContentComponent,
      },
      {
        path: 'client-management/add',
        component: AddEditOrganizationComponent,
        canDeactivate: [UnsavedChangesGuard]
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
