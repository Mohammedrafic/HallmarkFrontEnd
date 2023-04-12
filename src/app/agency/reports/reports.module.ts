import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgencyReportsComponent } from '../reports/reports.component';
import { FinancialTimesheetReportComponent } from './financial-timesheet-report/financial-timesheet-report.component';
import { SideMenuModule } from '../../shared/components/side-menu/side-menu.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AgencyReportsComponent,
    FinancialTimesheetReportComponent
  ],
  imports: [
    CommonModule,
    SideMenuModule,
    RouterModule
  ]
})
export class AgencyReportsModule { }
