import { ScheduleApiService } from 'src/app/modules/schedule/services/schedule-api.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiWebReportComponent } from '@shared/components/logi-web-report/logi-web-report.component';
import { AutoCompleteAllModule, DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { UserState } from 'src/app/store/user.state';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SecurityState } from 'src/app/security/store/security.state';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ButtonModule, CheckBoxAllModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { SharedModule } from '@shared/shared.module';

import { FeatherModule } from 'angular-feather';
import { AgencyReportsComponent } from './agency-reports.component';
import { FinancialTimesheetReportComponent } from './financial-timesheet-report/financial-timesheet-report.component';
import { AgencyReportsRoutingModule } from './agency-reports-routing.module';
import { LogiReportModule } from '../../shared/components/logi-report/logi-report.module';
import { InvoiceSummaryReportComponent } from './invoice-summary-report/invoice-summary-report.component';


@NgModule({
  declarations: [    
    AgencyReportsComponent,
    FinancialTimesheetReportComponent,
    InvoiceSummaryReportComponent
  ],
  imports: [
    CommonModule,   
    SharedModule,
    FormsModule,
    ReactiveFormsModule,    
    AgencyReportsRoutingModule,
    MultiSelectAllModule,
    DropDownListModule,
    CheckBoxAllModule,
    DatePickerModule,
    ButtonModule,
    FeatherModule,
    AutoCompleteAllModule,
    RadioButtonModule,
    LogiReportModule,
    NgxsModule.forFeature([OrganizationManagementState, UserState, SecurityState, LogiReportState]),
  ],
  providers: [
    ScheduleApiService
  ]
})
export class AgencyReportsModule { }
