import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardContentComponent } from './dashboard/dashboard-content/dashboard-content.component';
import { OrderManagementContentComponent } from './order-management/order-management-content/order-management-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardContentComponent,
      },
      {
        path: 'order-management/:param',
        component: OrderManagementContentComponent,
      },
      {
        path: 'time-sheets/:param',
        component: TimesheetsContentComponent,
      },
      {
        path: 'invoices/:param',
        component: InvoicesContentComponent,
      },
      {
        path: 'candidates',
        component: CandidatesContentComponent,
      },
      {
        path: 'reports',
        component: ReportsContentComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
