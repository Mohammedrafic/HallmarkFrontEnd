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
  runId: string;
  path: string;
  createdAt: DateTime;
}
