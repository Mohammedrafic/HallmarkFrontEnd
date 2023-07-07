export class GetCustomReportPage {
  static readonly type = '[Custom Report] Get Custom Report Page';
  constructor(
    public organizationId: number | null,
    public pageNumber: number,
    public pageSize: number,
  ) { }
}
