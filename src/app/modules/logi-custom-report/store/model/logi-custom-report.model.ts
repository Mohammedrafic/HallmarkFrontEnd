import { DateTime } from "@syncfusion/ej2-angular-charts";

export class LogiCustomReportPage {
  items: LogiCustomReport[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export class LogiCustomReport {
  id: string;
  customReportName: string;
  isSystem: boolean;
  path: string;
  catalogPath: string;
  reportParamaters: string;
  createdAt: DateTime;
  lastModifiedAt: DateTime;
  CreatedBy: string;
  LastModifiedBy: string;
  businessUnitId: number;
}


export class AddLogiCustomReportRequest {
 
  customReportName: string;
  isSystem: boolean;
  path: string;
  catalogPath: string;
  reportParamaters: string;
  businessUnitId: number;
}
