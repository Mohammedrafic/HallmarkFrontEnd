import { AddLogiCustomReportRequest } from "../model/logi-custom-report.model";

export class GetCustomReportPage {
  static readonly type = '[Custom Report] Get Custom Report Page';
  constructor(
    public organizationId: number | null,
    public pageNumber: number,
    public pageSize: number,
  ) { }
}

export class SaveCustomReport {
  static readonly type = '[Custom Report] Save ';
  constructor(
    public addLogiCustomReportRequest: AddLogiCustomReportRequest
  ) { }
}
