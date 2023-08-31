export enum OrderAuditHistoryTableColumns {
  orderId = "order Id",
  orderType = "orderType",
  orderStatus = "orderStatus",
  title = "title",
  regionName = "regionName",
  locationName = "locationName",
  departmentName = "departmentName",
  skill = "skill",
  hourlyRate = "hourlyRate",
  openPositions = "openPositions",
  duration = "duration",
  jobStartDate = "jobStartDate",
  jobEndDate = "jobEndDate",
  shiftStartTime = "shiftStartTime",
  shiftEndTime = "shiftEndTime",
  onCallRequired = "onCallRequired",
  asapStart = "asapStart",
  criticalOrder = "criticalOrder",
  orderRequisitionReasonName = "orderRequisitionReasonName",
  changeType = "changeType",
  modifiedOn = "modifiedOn",
  modifiedBy = "modifiedBy"
}

export enum OrderCredentialAuditHistoryTableColumns {
  credentialType = "Credential Type",
  credentialName = "Credential Name",
  reqForSubmission = "Req. For Submission",
  reqForOnboard = "Req. For Onboard",
  optional = "Optional",
  comment = "comment",
  changeType = "Change Type",
  modifiedOn = "Modified Date",
  modifiedBy = "Modified By"
}

export enum OrderBillRateAuditHistoryTableColumns {
  bIllRateTitle = "Bill Rate Title",
  billRateCategory = "Bill Rate Category",
  payRateType = "Pay Rate Type",
  rateHour = "Rate Hour",
  effectiveDate = "Effective Date",
  dailyOtEnabled = "Daily ot Enabled",
  seventhDayOtEnabled = " 7th Day OT Enabled",
  weeklyOtEnabled = "Weekly OT Enabled",
  isPredefined = "IsPredefined",
  changeType = "Change Type",
  modifiedOn = "Modified Date",
  modifiedBy = "Modified By"
}


export enum OrderContactAuditHistoryTableColumns {
  name = "Name",
  title = "Title",
  email = "Email",
  mobilePhone = "Mobile Phone",
  isPrimaryContact = "Primary Contact",
  changeType = "Change Type",
  modifiedOn = "Modified Date",
  modifiedBy = "Modified By"
}


export enum OrderWorkLocationAuditHistoryTableColumns {
  address = "address",
  state = "state",
  city = "city",
  zipCode = "zipCode",  
  changeType = "Change Type",
  modifiedOn = "Modified Date",
  modifiedBy = "Modified By"
}

export enum OrderJobDistributionAuditHistoryTableColumns {
  jobDistributionOption = "Job Distribution Option",
  agency = "Agency",
  changeType = "change Type",
  modifiedOn = "Modified Date",
  modifiedBy = "Modified By"
}

export enum OrderClassificationAuditHistoryTableColumns {
  classification = "Classification",  
  changeType = "change Type",
  modifiedOn = "Modified Date",
  modifiedBy = "Modified By"
}