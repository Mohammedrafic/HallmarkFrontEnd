import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardContentComponent } from './dashboard/dashboard-content/dashboard-content.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';

const routes: Routes = [
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: '',
        component: DashboardContentComponent,
      },
      {
        path: 'client-management',
        component: ClientManagementContentComponent,
      },
      {
        path: 'time-sheets',
        component: TimesheetsContentComponent,
      },
      {
        path: 'invoices',
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
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
