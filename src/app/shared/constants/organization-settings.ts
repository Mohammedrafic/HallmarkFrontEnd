export enum OrganizationSettingKeys {
  InternalAgencyApplies,
  AllowDNWInTimesheets,
  EnableLTAConcept,
  EnableRegularLocalRates,
  EnableInvoiceInterface,
  AutoLockOrder,
  ShowAgencyInUploadDocuments,
  IsReOrder,
  AllowDocumentUpload,
  JobDistributionOptions,
  NetPaymentTerms,
  OrderPushStartDate,
  CloseTheOrderIfNoAction,
  NoOfIdealDaysToBeConsidered,
  CandidateStatusToBeConsidered,
  InvoiceGeneration,
  DayOfGeneration,
  GroupBy,
  BillingContactEmails,
  OrganizationCanEditTimesheet,
  AgencyCanEditApprovedTimesheet,
  AllowAgencyToBidOnCandidateBillRateBeyondOrderBillRate,
  NoOfDaysAllowedForTimesheetEdit,
  AllowAutoApprovalProcessOfTimesheets,
  AgencyAbleSubmitWithoutAttachments,
  EnableChat,
  PayHigherBillRates,
  TieringLogic,
  InvoiceAutoGeneration
}

export enum OrganizationalHierarchy {
  Organization = 1,
  Region = 2,
  Location = 3,
  Department = 4
}
