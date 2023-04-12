
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FinancialTimesheetReportComponent } from "./financial-timesheet-report/financial-timesheet-report.component";
import { AgencyReportsComponent } from "./reports.component";

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
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
      },],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyReportsRoutingModule { }
