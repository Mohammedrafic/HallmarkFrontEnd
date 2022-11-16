
export const analyticsConstants = {
  formControlNames: {
    BusinessIds: 'businessIds',
    RegionIds: 'regionIds',
    LocationIds: 'locationIds',
    DepartmentIds: 'departmentIds',
    StartDate: 'startDate',
    EndDate:'endDate',
    AccrualReportTypes: 'accrualReportTypes',
    SkillCategoryIds: 'skillCategoryIds',
    SkillIds: 'skillIds',
    CandidateStatuses: 'candidateStatuses',
    JobId:'jobId',
    CandidateName:'candidateName',
    OrderTypes:'orderTypes',
    JobStatuses:'jobStatuses',
    AgencyIds: 'agencyIds',
    Months: 'months',
    Years: 'years',
    InvoiceStatuses: 'invoiceStatuses',
    InvoiceID: 'invoiceID'
  }
}
export const accrualReportTypesList : { name: string; id: number }[] = [
  { name: 'Invoice date range', id: 0 },
  { name: 'Timesheet date range', id: 1 }
];


export const invoiceStatusList: { name: string; id: number }[] = [
  { name: 'Submitted pend appr', id: 1 },
  { name: 'Pending Payment', id: 2 },
  { name: 'Paid', id: 0 }
];

export const paymentStatusList: { name: string; id: number }[] = [
  { name: 'Paid', id: 1 },
  { name: 'Short Paid', id: 2 },
  { name: 'Over Paid', id: 3 }
];

export const monthList: { name: string; id: number }[] = [
  { name: 'January', id: 1 },
  { name: 'February', id: 2 },
  { name: 'March', id: 3 },
  { name: 'April', id: 4 },
  { name: 'May', id: 5 },
  { name: 'June', id: 6 },
  { name: 'July', id: 7 },
  { name: 'August', id: 8 },
  { name: 'September', id: 9 },
  { name: 'October', id: 10 },
  { name: 'November', id: 11 },
  { name: 'December', id: 12 }
];

export const yearList: { name: number; id: number }[] = [
  { name: (new Date()).getFullYear() - 10, id: 1 },
  { name: (new Date()).getFullYear() - 9, id: 2 },
  { name: (new Date()).getFullYear() - 8, id: 3 },
  { name: (new Date()).getFullYear() - 7, id: 4 },
  { name: (new Date()).getFullYear() - 6, id: 5 },
  { name: (new Date()).getFullYear() - 5, id: 6 },
  { name: (new Date()).getFullYear() - 4, id: 7 },
  { name: (new Date()).getFullYear() - 3, id: 8 },
  { name: (new Date()).getFullYear() - 2, id: 9 },
  { name: (new Date()).getFullYear() - 1, id: 10 },
  { name: (new Date()).getFullYear(), id: 11 },
  { name: (new Date()).getFullYear() + 1, id: 12 }
];


