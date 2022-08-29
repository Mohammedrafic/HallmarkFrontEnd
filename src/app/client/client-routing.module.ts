import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderManagementContentComponent } from './order-management/order-management-content/order-management-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';
import { AddEditOrderComponent } from './order-management/add-edit-order/add-edit-order.component';
import { UnsavedOrderChangesGuard } from './guards/unsaved-order-changes.guard';
import { CandidateDetailsComponent } from '@shared/components/candidate-details/candidate-details.component';
import { AssociateListComponent } from '@shared/components/associate-list/associate-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then((mod) => mod.DashboardModule),
        data: {
          isOrganizationArea: true,
          isAgencyArea: true,
        },
      },
      {
        path: 'order-management',
        component: OrderManagementContentComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'associate-list',
        component: AssociateListComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'order-management/add',
        component: AddEditOrderComponent,
        data: {
          isOrganizationArea: true,
          isEditing: false,
        },
        canDeactivate: [UnsavedOrderChangesGuard],
      },
      {
        path: 'order-management/edit/:orderId',
        component: AddEditOrderComponent,
        data: {
          isOrganizationArea: true,
          isEditing: true,
        },
        canDeactivate: [UnsavedOrderChangesGuard],
      },
      {
        path: 'time-sheets/:param',
        component: TimesheetsContentComponent,
      },
      {
        path: 'invoices',
        loadChildren: () => import('../modules/invoices/invoices.module').then((m) => m.InvoicesModule),
        data: {
          isOrganizationArea: true,
          isAgencyArea: false,
        },
      },
      {
        path: 'candidates',
        component: CandidatesContentComponent,
        data: {
          isOrganizationArea: true,
          isAgencyArea: false,
        },
      },
      {
        path: 'reports',
        component: ReportsContentComponent,
      },
      {
        path: 'timesheets',
        loadChildren: () => import('../modules/timesheets/timesheets.module').then((m) => m.TimesheetsModule),
        data: {
          isOrganizationArea: true,
          isAgencyArea: false,
        },
      },
      {
        path: 'organization-management',
        loadChildren: () =>
          import('../organization-management/organization-management.module').then(
            (m) => m.OrganizationManagementModule
          ),
        //     canLoad: [ AdminGuard ],
        //     canActivate: [ AdminGuard ]
      },
      {
        path: 'candidate-details',
        component: CandidateDetailsComponent,
        data: {
          isOrganizationArea: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
