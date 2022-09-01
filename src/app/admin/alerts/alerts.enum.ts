export enum AlertEnum {
    No,
    Yes,
  }
  export enum AlertChannel {
    Email=1,
    SMS=2,
    OnScreen=3
  }
  export enum AlertParameterEnum {
    MyOrganization=1,
    Agency=2,
    OrderId=3,
    JobTitle=4,
    ClickbackURL=5
  }
  export enum AlertIdEnum {
    CandStatusAccepted=1,
    CandStatusApplied =2,
    CandStatusRejected=3,
    CandStatusSendReorderOnboardemails=4,
    CandStatusSendToManagerReviewExternalAgencies=5,
    CandStatusSendToManagerReviewInternalAgencies=6,
    JobPublicComments=7,
    JobStatusOpen=8,
    JobStatusPendingApproval=9,
    PushReportsAccrualreport=10,
    PushReportsHeadCountReportMetrics=11,
    PushReportsReportYTDSummary=12,
    PushReportsAgingReport=13,
    PushReportsCandidatesordersendinginnext45days=14,
    PushReportsJobspushedfromEIItoVMS=15,
    PushReportsReportFillRate=16,
    TimeSheetDNW=17,
    TimeSheetOrgpendingapproval=18,
    BillRateUpdatedonanOrder=19,
    OrderCreated=20,
    OrderUpdated=21
  }
  