import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyComponent } from './agency.component';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';
import { CandidatesComponent } from "./candidates/candidates.component";
import { AddEditCandidateComponent } from "./candidates/add-edit-candidate/add-edit-candidate.component";
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AgencyComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
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
      {
        path: 'agency-list/edit/:id',
        component: AddEditAgencyComponent,
      },
      {
        path: 'candidates',
        component: CandidatesComponent,
      },
      {
        path: 'candidates/add',
        component: AddEditCandidateComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyRoutingModule {}
