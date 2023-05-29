import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateEditOrderComponent } from '@client/order-management/create-edit-order.component';
import { AssociateListComponent } from '@shared/components/associate-list/associate-list.component';
import { CandidateDetailsComponent } from '@shared/components/candidate-details/candidate-details.component';
import { ClientComponent } from './client.component';
import { DoNotReturnDetailsComponent } from './do-not-return/do-not-return-details/do-not-return-details.component';
import { UnsavedOrderChangesGuard } from './guards/unsaved-order-changes.guard';
import { OrderManagementContentComponent,
} from './order-management/components/order-management-content/order-management-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { NotificationResolver } from '@core/resolvers/notification.resolver';

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
        path: 'order-management/:notificationId',
        component: OrderManagementContentComponent,
        resolve: [NotificationResolver],
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
        component: CreateEditOrderComponent,
        data: {
          isOrganizationArea: true,
          isEditing: false,
        },
        canDeactivate: [UnsavedOrderChangesGuard],
      },
      {
        path: 'order-management/edit/:orderId',
        component: CreateEditOrderComponent,
        data: {
          isOrganizationArea: true,
          isEditing: true,
        },
        canDeactivate: [UnsavedOrderChangesGuard],
      },
      {
        path: 'order-management/add/:fromTemplate',
        component: CreateEditOrderComponent,
        data: {
          isOrganizationArea: true,
          isEditing: false,
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
        loadChildren: () =>
          import('../client/candidates/organization-candidates.module').then(
            (m: typeof import('../client/candidates/organization-candidates.module')) => m.OrganizationCandidatesModule
          ),
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
        path: 'scheduling',
        loadChildren: () => import('../modules/schedule/schedule.module').then((m) => m.ScheduleModule),
        data: {
          isOrganizationArea: true,
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
      {
        path: 'dnr-details',
        component: DoNotReturnDetailsComponent,
        data: {
          isOrganizationArea: true,
          isAgencyArea: false,
        },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class ClientRoutingModule {}
