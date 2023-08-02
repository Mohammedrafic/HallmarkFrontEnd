
export class GetuserlogReportPage {
  static readonly type = '[Custom Report] Get Userlog Report Page';
  constructor(
    public organizationId: number | null,
    public pageNumber: number,
    public pageSize: number,
  ) { }
}


