
export const analyticsConstants = {
  formControlNames: {
    BusinessIds: 'businessIds',
    RegionIds: 'regionIds',
    LocationIds: 'locationIds',
    DepartmentIds: 'departmentIds',
    StartDate: 'startDate',
    EndDate:'endDate',
    accrualReportTypes: 'accrualReportTypes',
    SkillCategoryIds: 'skillCategoryIds',
    SkillIds: 'skillIds',
    candidateStatuses: 'candidateStatuses',
    JobId:'jobId',
    CandidateName:'candidateName',


  }
}
export const accrualReportTypesList : { name: string; id: number }[] = [  
  { name: 'Timesheet date range', id: 1 },
  { name: 'Invoice date range', id: 0 }
];
