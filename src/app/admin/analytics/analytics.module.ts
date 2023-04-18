import { ScheduleApiService } from 'src/app/modules/schedule/services/schedule-api.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
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
import { CandidateJourneyComponent } from './candidate-journey/candidate-journey.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { FinancialTimeSheetReportComponent } from './financial-time-sheet-report/financial-time-sheet-report.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { AgingDetailsComponent } from './aging-details/aging-details.component';
import { ClientFinanceReportComponent } from './client-finance-report/client-finance-report.component';
import { CredentialExpiryComponent } from './credential-expiry/credential-expiry.component';
import { TimesheetReportComponent } from './timesheet-report/timesheet-report.component';
import { VmsInvoiceReportComponent } from './vms-invoice-report/vms-invoice-report.component';
import { FinanceReportComponent } from './finance-report/finance-report.component';
import { YtdSummaryComponent } from './ytd-summary/ytd-summary.component';
import { MissingCredentialsComponent } from './missing-credentials/missing-credentials.component';
import { HeadCountComponent } from './head-count/head-count.component';
import { CandidateAgencyStatusReportComponent } from './candidate-agency-status-report/candidate-agency-status-report.component';
import { VendorScorecardComponent } from './vendor-scorecard/vendor-scorecard.component';
import { JobEventComponent } from './job-event/job-event.component';
import { GeneralCommentsComponent } from './general-comments/general-comments.component';
import { YtdReportComponent } from './ytd-report/ytd-report.component';
import { AgencyDepartmentSpentHoursComponent } from './agency-department-spent-hours/agency-department-spent-hours.component';
import { StaffingSummaryComponent } from './staffing-summary/staffing-summary.component';
import { PredictedContractLaborSpentComponent } from './predicted-contract-labor-spent/predicted-contract-labor-spent.component';
import { JobSummaryComponent } from './job-summary/job-summary.component';
import { EventLogComponent } from './event-log/event-log.component';
import { MissingKronosIdsComponent } from './missing-kronos-ids/missing-kronos-ids.component';
import { BenchmarkingRateByStateComponent } from './benchmarking-rate-by-state/benchmarking-rate-by-state.component';
import { OrganizationInvoiceComponent } from './organization-invoice/organization-invoice.component';
import { JobComplianceComponent } from './job-compliance/job-compliance.component';
import { JobFillRatioComponent } from './job-fill-ratio/job-fill-ratio.component';
import { JobDetailsSummaryComponent } from './job-details-summary/job-details-summary.component';
import { LaborUtilizationComponent } from './labor-utilization/labor-utilization.component';
import { MessageHistoryComponent } from './message-history/message-history.component';
import { OrderCheckComponent } from './order-check/order-check.component';
import { OverallStatusComponent } from './overall-status/overall-status.component';
import { OvertimeComponent } from './overtime/overtime.component';
import { FeatherModule } from 'angular-feather';
import { AccrualReportComponent } from './accrual-report/accrual-report.component';
import { DailyOrderStatusComponent } from './daily-order-status/daily-order-status.component';
import { CandidateStatusComponent } from './candidate-status/candidate-status.component';
import { VendorActivityComponent } from './vendor-activity/vendor-activity.component';
import { StaffScheduleByShiftComponent } from './staff-schedule-by-shift/staff-schedule-by-shift.component';
import { StaffListComponent } from './staff-list/staff-list.component';
import { FinanceMedicareWageReportComponent } from './finance-medicare-wage-report/finance-medicare-wage-report.component';
import { GrantReportComponent } from './grant-report/grant-report.component';
import { ScheduledHoursComponent } from './scheduled-hours/scheduled-hours.component';
import { LogiReportModule } from '../../shared/components/logi-report/logi-report.module';


@NgModule({
  declarations: [
    AnalyticsComponent,
    CandidateListComponent,
    LogiWebReportComponent,
    CandidateJourneyComponent,
    JobDetailsComponent,
    FinancialTimeSheetReportComponent,
    InvoiceSummaryComponent,
    AgingDetailsComponent,
    ClientFinanceReportComponent,
    CredentialExpiryComponent,
    TimesheetReportComponent,
    VmsInvoiceReportComponent,
    FinanceReportComponent,
    YtdSummaryComponent,
    MissingCredentialsComponent,
    HeadCountComponent,
    CandidateAgencyStatusReportComponent,
    VendorScorecardComponent,
    JobEventComponent,
    GeneralCommentsComponent,
    YtdReportComponent,
    AgencyDepartmentSpentHoursComponent,
    StaffingSummaryComponent,
    PredictedContractLaborSpentComponent,
    JobSummaryComponent,
    EventLogComponent,
    MissingKronosIdsComponent,
    BenchmarkingRateByStateComponent,
    OrganizationInvoiceComponent,
    JobComplianceComponent,
    JobFillRatioComponent,
    JobDetailsSummaryComponent,
    LaborUtilizationComponent,
    MessageHistoryComponent,
    OrderCheckComponent,
    OverallStatusComponent,
    OvertimeComponent,
    AccrualReportComponent,
    DailyOrderStatusComponent,
    CandidateStatusComponent,
    VendorActivityComponent,
    StaffScheduleByShiftComponent,
    StaffListComponent,
    FinanceMedicareWageReportComponent,
    GrantReportComponent,
    ScheduledHoursComponent],
  exports: [
    CandidateListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AnalyticsRoutingModule,
    MultiSelectAllModule,
    DropDownListModule,
    CheckBoxAllModule,
    DatePickerModule,
    ButtonModule,
    FeatherModule,
    AutoCompleteAllModule,
    RadioButtonModule,
    LogiReportModule,
    NgxsModule.forFeature([OrganizationManagementState, UserState, SecurityState, LogiReportState])
  ],
  providers:[
    ScheduleApiService
  ]
})
export class AnalyticsModule { }
