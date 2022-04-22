import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyComponent } from './agency.component';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AgencyComponent,
    children: [
      {
        path: 'dashboard',
        component: AgencyListComponent,
      },
      {
        path: 'organization',
        component: AgencyListComponent,
      },
      {
        path: 'agency-list',
        component: AgencyListComponent,
      },
      {
        path: 'agency-list/add',
        component: AddEditAgencyComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyRoutingModule {}
