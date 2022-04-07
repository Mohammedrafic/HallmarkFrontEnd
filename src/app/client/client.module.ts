import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { DashboardHeaderComponent } from './dashboard/dashboard-header/dashboard-header.component';
import { DashboardContentComponent } from './dashboard/dashboard-content/dashboard-content.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { ClientManagementHeaderComponent } from './client-management/client-management-header/client-management-header.component';
import { CandidatesHeaderComponent } from './candidates/candidates-header/candidates-header.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { InvoicesHeaderComponent } from './invoices/invoices-header/invoices-header.component';
import { ReportsHeaderComponent } from './reports/reports-header/reports-header.component';
import { TimesheetsHeaderComponent } from './timesheets/timesheets-header/timesheets-header.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientPageComponent } from './client-page/client-page.component';

@NgModule({
  declarations: [
    DashboardHeaderComponent,
    DashboardContentComponent,
    ClientPageComponent,
    ClientManagementContentComponent,
    ClientManagementHeaderComponent,
    CandidatesHeaderComponent,
    CandidatesContentComponent,
    InvoicesContentComponent,
    InvoicesHeaderComponent,
    ReportsHeaderComponent,
    TimesheetsHeaderComponent,
    TimesheetsContentComponent,
    ReportsContentComponent,
  ],
  imports: [CommonModule, ClientRoutingModule],
})
export class ClientModule {}
