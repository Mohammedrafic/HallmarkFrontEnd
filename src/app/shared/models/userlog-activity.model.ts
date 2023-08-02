import { DateTime } from "@syncfusion/ej2-angular-charts";

export class useractivitlogreportPage {
    items: userActivity[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }
  
  export class userActivity {
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
  
  