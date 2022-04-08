import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { DashboardContentComponent } from './dashboard/dashboard-content/dashboard-content.component';
import { ClientManagementContentComponent } from './client-management/client-management-content/client-management-content.component';
import { CandidatesContentComponent } from './candidates/candidates-content/candidates-content.component';
import { InvoicesContentComponent } from './invoices/invoices-content/invoices-content.component';
import { TimesheetsContentComponent } from './timesheets/timesheets-content/timesheets-content.component';
import { ReportsContentComponent } from './reports/reports-content/reports-content.component';
import { ClientComponent } from './client.component';

@NgModule({
  declarations: [
    DashboardContentComponent,
    ClientComponent,
    ClientManagementContentComponent,
    CandidatesContentComponent,
    InvoicesContentComponent,
    TimesheetsContentComponent,
    ReportsContentComponent,
  ],
  imports: [CommonModule, ClientRoutingModule],
})
export class ClientModule {}
