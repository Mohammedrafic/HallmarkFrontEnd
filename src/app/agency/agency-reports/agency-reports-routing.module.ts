
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FinancialTimesheetReportComponent } from "./financial-timesheet-report/financial-timesheet-report.component";
import { AgencyReportsComponent } from "./agency-reports.component";
import { InvoiceSummaryComponent } from "../../admin/analytics/invoice-summary/invoice-summary.component";
import { InvoiceSummaryReportComponent } from "./invoice-summary-report/invoice-summary-report.component";
import { MissingCredentialsAgencyComponent } from "./missing-credentials-agency/missing-credentials-agency.component";

const routes: Routes = [ 
  {
    path: '',
    component: AgencyReportsComponent,
    children: [
      {
        path: 'financial-timesheet-report',
        component: FinancialTimesheetReportComponent,
        data: {
          isAgencyArea: true,
        }
      },
      {
        path: 'invoice-summary-report',
        component: InvoiceSummaryReportComponent,
        data: {
          isAgencyArea: true,
        }
      },
      {
        path: 'missing-credentials-agency',
        component: MissingCredentialsAgencyComponent,
        data: {
          isAgencyArea: true,
        }
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyReportsRoutingModule { }
