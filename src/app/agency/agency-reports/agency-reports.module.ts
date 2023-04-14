import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgencyReportsComponent } from '../agency-reports/agency-reports.component';
import { FinancialTimesheetReportComponent } from './financial-timesheet-report/financial-timesheet-report.component';
import { AgencyReportsRoutingModule } from './agency-reports-routing.module';
import { SideMenuModule } from '@shared/components/side-menu/side-menu.module';


@NgModule({
  declarations: [
    AgencyReportsComponent,
    FinancialTimesheetReportComponent
  ],
  imports: [
    CommonModule,   
    SideMenuModule,
    AgencyReportsRoutingModule,
  ]
})
export class AgencyReportsModule { }
