import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyComponent } from './agency.component';
import { AgencyListComponent } from './agency-list/agency-list.component';
import { AddEditAgencyComponent } from './agency-list/add-edit-agency/add-edit-agency.component';
import { CandidatesComponent } from "./candidates/candidates.component";
import { AddEditCandidateComponent } from "./candidates/add-edit-candidate/add-edit-candidate.component";
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClearAgencyGuard } from './guards/clear-agency.guard';
import { OrderManagementComponent } from './order-management/order-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AgencyComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          isOrganizationArea: true,
          isAgencyArea: true
        }
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
        canDeactivate: [ClearAgencyGuard]
      },
      {
        path: 'agency-list/edit/:id',
        component: AddEditAgencyComponent,
        canDeactivate: [ClearAgencyGuard]
      },
      {
        path: 'candidates',
        component: CandidatesComponent,
        data: {
          isAgencyArea: true
        }
      },
      {
        path: 'candidates/add',
        component: AddEditCandidateComponent,
        data: {
          isAgencyArea: true
        }
      },
      {
        path: 'candidates/edit/:id',
        component: AddEditCandidateComponent,
        data: {
          isAgencyArea: true
        }
      },
      {
        path: 'order-management',
        component: OrderManagementComponent,
        data: {
          isAgencyArea: true
        }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyRoutingModule {}
