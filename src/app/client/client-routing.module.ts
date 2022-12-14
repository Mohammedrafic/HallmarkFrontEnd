import { NgModule } from '@angular/core';
import { Route, RouterModule, ROUTES, Routes } from '@angular/router';

import { Store } from '@ngxs/store';

import {
  OrderManagementContentComponent,
} from './order-management/order-management-content/order-management-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';
import { AddEditOrderComponent } from './order-management/add-edit-order/add-edit-order.component';
import { UnsavedOrderChangesGuard } from './guards/unsaved-order-changes.guard';
import { CandidateDetailsComponent } from '@shared/components/candidate-details/candidate-details.component';
import { AssociateListComponent } from '@shared/components/associate-list/associate-list.component';
import { AppState } from '../store/app.state';

const orderManagementContentComponentRoute: Route = {
  path: 'order-management',
  component: OrderManagementContentComponent,
  data: {
    isOrganizationArea: true,
  },
};

const orderManagementIrpRoute: Route = {
  path: 'order-management',
  loadChildren: () => import('./order-management-irp/order-management-irp.module')
    .then((m) => m.OrderManagementIrpModule),
  data: {
    isOrganizationArea: true,
  },
};

function routesFactory(store: Store): Routes {
  const isIrpFeatureFlagEnabled = store.selectSnapshot(AppState.isIrpFlagEnabled) || true;
  const orderManagementRoute = isIrpFeatureFlagEnabled ? orderManagementIrpRoute : orderManagementContentComponentRoute;

  return [
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
        orderManagementRoute,
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
          path: 'order-management/add/:fromTemplate',
          component: AddEditOrderComponent,
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
}

@NgModule({
  imports: [],
  exports: [RouterModule],
  providers: [
    {
      provide: ROUTES,
      useFactory: routesFactory,
      multi: true,
      deps: [Store],
    },
  ],
})
export class ClientRoutingModule {}
