
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
  }
}
export const accrualReportTypesList : { name: string; id: number }[] = [  
  { name: 'Timesheet date range', id: 1 },
  { name: 'Invoice date range', id: 0 }
];
