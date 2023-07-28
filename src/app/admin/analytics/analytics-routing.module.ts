import { AgencySpendComponent } from './agency-spend/agency-spend.component';
import { StaffAvailabilityComponent } from './staff-availability/staff-availability.component';
import { HoursByDepartmentComponent } from './hours-by-department/hours-by-department.component';
import { UnitProfileComponent } from './unit-profile/unit-profile.component';
import { ScheduledHoursComponent } from './scheduled-hours/scheduled-hours.component';
import { StaffListComponent } from './staff-list/staff-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationInvoicesContainerService } from '../../modules/invoices/services/invoices-container/organization-invoices-container.service';
import { FinancialTimeSheetReportComponent } from './financial-time-sheet-report/financial-time-sheet-report.component';
import { AgencyDepartmentSpentHoursComponent } from './agency-department-spent-hours/agency-department-spent-hours.component';
import { AgingDetailsComponent } from './aging-details/aging-details.component';
import { AnalyticsComponent } from './analytics.component';
import { BenchmarkingRateByStateComponent } from './benchmarking-rate-by-state/benchmarking-rate-by-state.component';
import { CandidateAgencyStatusReportComponent } from './candidate-agency-status-report/candidate-agency-status-report.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { ClientFinanceReportComponent } from './client-finance-report/client-finance-report.component';
import { CredentialExpiryComponent } from './credential-expiry/credential-expiry.component';
import { EventLogComponent } from './event-log/event-log.component';
import { CandidateJourneyComponent } from './candidate-journey/candidate-journey.component';
import { FinanceReportComponent } from './finance-report/finance-report.component';
import { GeneralCommentsComponent } from './general-comments/general-comments.component';
import { HeadCountComponent } from './head-count/head-count.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { JobComplianceComponent } from './job-compliance/job-compliance.component';
import { JobDetailsSummaryComponent } from './job-details-summary/job-details-summary.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { JobEventComponent } from './job-event/job-event.component';
import { JobFillRatioComponent } from './job-fill-ratio/job-fill-ratio.component';
import { JobSummaryComponent } from './job-summary/job-summary.component';
import { LaborUtilizationComponent } from './labor-utilization/labor-utilization.component';
import { MessageHistoryComponent } from './message-history/message-history.component';
import { MissingCredentialsComponent } from './missing-credentials/missing-credentials.component';
import { MissingKronosIdsComponent } from './missing-kronos-ids/missing-kronos-ids.component';
import { OrderCheckComponent } from './order-check/order-check.component';
import { OrganizationInvoiceComponent } from './organization-invoice/organization-invoice.component';
import { OverallStatusComponent } from './overall-status/overall-status.component';
import { OvertimeComponent } from './overtime/overtime.component';
import { PredictedContractLaborSpentComponent } from './predicted-contract-labor-spent/predicted-contract-labor-spent.component';
import { StaffingSummaryComponent } from './staffing-summary/staffing-summary.component';
import { TimesheetReportComponent } from './timesheet-report/timesheet-report.component';
import { VendorScorecardComponent } from './vendor-scorecard/vendor-scorecard.component';
import { VmsInvoiceReportComponent } from './vms-invoice-report/vms-invoice-report.component';
import { YtdReportComponent } from './ytd-report/ytd-report.component';
import { YtdSummaryComponent } from './ytd-summary/ytd-summary.component';
import { AccrualReportComponent } from './accrual-report/accrual-report.component';
import { DailyOrderStatusComponent } from './daily-order-status/daily-order-status.component';
import { CandidateStatusComponent } from './candidate-status/candidate-status.component';
import { VendorActivityComponent } from './vendor-activity/vendor-activity.component';
import { StaffScheduleByShiftComponent } from './staff-schedule-by-shift/staff-schedule-by-shift.component';
import { FinanceMedicareWageReportComponent } from './finance-medicare-wage-report/finance-medicare-wage-report.component';
import { GrantReportComponent } from './grant-report/grant-report.component';
import { VmsInvoiceReportBetaComponent } from './vms-invoice-report-beta/vms-invoice-report-beta.component';
import { PositionSummaryComponent } from './Position-Summary/Position-Summary.component';
import { ShiftBreakdownComponent } from './shift-breakdown/shift-breakdown.component';
import { UserActivityComponent } from './user-activity/user-activity.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsComponent,
    children: [
      {
        path: 'financial-time-sheet-report',
        component: FinancialTimeSheetReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'invoice-summary',
        component: InvoiceSummaryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'aging-details',
        component: AgingDetailsComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'client-finance-report',
        component: ClientFinanceReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'accrual-report',
        component: AccrualReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'credential-expiry',
        component: CredentialExpiryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'timesheet-report',
        component: TimesheetReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'vms-invoice-report',
        component: VmsInvoiceReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'finance-report',
        component: FinanceReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'candidate-journey',
        component: CandidateJourneyComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'ytd-summary',
        component: YtdSummaryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'missing-credentials',
        component: MissingCredentialsComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'head-count',
        component: HeadCountComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'candidate-agency-status-report',
        component: CandidateAgencyStatusReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'candidate-list',
        component: CandidateListComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'vendor-scorecard',
        component: VendorScorecardComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'job-event',
        component: JobEventComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'general-comments',
        component: GeneralCommentsComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'ytd-report',
        component: YtdReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'agency-department-spent-hours',
        component: AgencyDepartmentSpentHoursComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'staffing-summary',
        component: StaffingSummaryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'predicted-contract-labor-spent',
        component: PredictedContractLaborSpentComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'job-summary',
        component: JobSummaryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'event-log',
        component: EventLogComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'missing-kronos-ids',
        component: MissingKronosIdsComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'benchmarking-rate-by-state',
        component: BenchmarkingRateByStateComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'organization-invoice',
        component: OrganizationInvoiceComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'job-compliance',
        component: JobComplianceComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'job-fill-ratio',
        component: JobFillRatioComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'job-details',
        component: JobDetailsComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'credential-summary',
        component: JobDetailsSummaryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'labor-utilization',
        component: LaborUtilizationComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'message-history',
        component: MessageHistoryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'order-check',
        component: OrderCheckComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'overall-status',
        component: OverallStatusComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'overtime',
        component: OvertimeComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'daily-order',
        component: DailyOrderStatusComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'candidate-status',
        component: CandidateStatusComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'vendor-activity',
        component: VendorActivityComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'staffschedulebyshift-irp',
        component: StaffScheduleByShiftComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'staff-list',
        component: StaffListComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'finance-medicare-wage-report',
        component: FinanceMedicareWageReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'grant-report',
        component: GrantReportComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'scheduled-hours',
        component: ScheduledHoursComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'vms-invoice-report-beta',
        component: VmsInvoiceReportBetaComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'unit-profile',
        component: UnitProfileComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'hours-by-department',
        component: HoursByDepartmentComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'staff-availability',
        component: StaffAvailabilityComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'Position-Summary',
        component: PositionSummaryComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'agency-spend',
        component: AgencySpendComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'shift-breakdown',
        component: ShiftBreakdownComponent,
        data: {
          isOrganizationArea: true,
        }
      },
      {
        path: 'user-activity',
        component: UserActivityComponent,
        data: {
          isOrganizationArea: true,
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalyticsRoutingModule { }
