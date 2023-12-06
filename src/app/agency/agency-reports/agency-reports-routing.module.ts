
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FinancialTimesheetReportComponent } from "./financial-timesheet-report/financial-timesheet-report.component";
import { AgencyReportsComponent } from "./agency-reports.component";
import { InvoiceSummaryComponent } from "../../admin/analytics/invoice-summary/invoice-summary.component";
import { InvoiceSummaryReportComponent } from "./invoice-summary-report/invoice-summary-report.component";
import { MissingCredentialsAgencyComponent } from "./missing-credentials-agency/missing-credentials-agency.component";
import { CredientialExpiryAgencyComponent } from "./crediential-expiry-agency/crediential-expiry-agency.component";
import { UserActivityComponent } from "./user-activity/user-activity.component";
import { CandidateEligibilityAgencyComponent } from "./candidate-eligibility-agency/candidate-eligibility-agency.component";
import { VendorScorecardComponent } from "./vendor-scorecard/vendor-scorecard.component";
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
      {
        path: 'credentials-expiry-agency',
        component: CredientialExpiryAgencyComponent,
        data: {
          isAgencyArea: true,
        }
      },
      {
        path: 'useractivity',
        component: UserActivityComponent,
        data: {
          isAgencyArea: true,
        }
      },
      {
        path: 'candidate-eligibility-agency',
        component: CandidateEligibilityAgencyComponent,
        data: {
          isAgencyArea: true,
        }
      },
      {
        path: 'vendor-scorecard',
        component: VendorScorecardComponent,
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
