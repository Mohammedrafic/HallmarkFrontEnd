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
  InvoiceAutoGeneration,
  SubmissionRequiredMinimum,
  CandidateEditTimesheets,
  AllowCandidateLogin,
  SSNRequiredToApplyPosition,
  DateOfBirthRequiredToAcceptPosition,
  CandidatePayRate,
  CandidateAppliedInLastNDays,
  SetDefaultCommentsScopeToExternal,
  LimitNumberOfSubmissionsInTotalToPosition,
  HideContactDetailsOfOrderInAgencyLogin,
  DisableAddEditTimesheetsInAgencyLogin,
  DefaultTimezone,
  OTHours,
  PayPeriod
}

export enum OrganizationalHierarchy {
  Organization = 1,
  Region = 2,
  Location = 3,
  Department = 4,
}


export enum OrganizationSettings{
  MandateCandidateAddress = "MandateCandidateAddress",
  MandateCandidatePhone1 = "MandateCandidatePhone1",
  EnableRegularLocalRates = "EnableRegularLocalRates"
}