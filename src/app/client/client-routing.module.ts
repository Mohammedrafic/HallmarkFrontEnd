import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardHeaderComponent } from './dashboard/dashboard-header/dashboard-header.component';
import { DashboardContentComponent } from './dashboard/dashboard-content/dashboard-content.component';
import { ClientManagementHeaderComponent } from './client-management/client-management-header/client-management-header.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { TimesheetsHeaderComponent } from './timesheets/timesheets-header/timesheets-header.component';
import { InvoicesHeaderComponent } from './invoices/invoices-header/invoices-header.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { CandidatesHeaderComponent } from './candidates/candidates-header/candidates-header.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { ReportsHeaderComponent } from './reports/reports-header/reports-header.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardHeaderComponent,
    outlet: 'header',
  },
  {
    path: '',
    component: DashboardContentComponent,
    outlet: 'content',
  },
  {
    path: 'client-management',
    component: ClientManagementHeaderComponent,
    outlet: 'header',
  },
  {
    path: 'client-management',
    component: ClientManagementContentComponent,
    outlet: 'content',
  },
  {
    path: 'time-sheets',
    component: TimesheetsHeaderComponent,
    outlet: '',
  },
  {
    path: 'time-sheets',
    component: TimesheetsContentComponent,
    outlet: 'content',
  },
  {
    path: 'invoices',
    component: InvoicesHeaderComponent,
    outlet: 'header',
  },
  {
    path: 'invoices',
    component: InvoicesContentComponent,
    outlet: 'content',
  },
  {
    path: 'candidates',
    component: CandidatesHeaderComponent,
    outlet: 'header',
  },
  {
    path: 'candidates',
    component: CandidatesContentComponent,
    outlet: 'content',
  },
  {
    path: 'reports',
    component: ReportsHeaderComponent,
    outlet: 'header',
  },
  {
    path: 'reports',
    component: ReportsContentComponent,
    outlet: 'content',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
