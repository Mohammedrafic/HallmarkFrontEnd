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

    message: string;

    utcDate: DateTime;

    eventType: string;

    eventTargetType: string;
    eventTarget: string;

    eventValue: string;

    screenUrl: string;

    screenName: string;

    client: string;

    userIP: string;

    userId: string


    isHallmark: boolean;

    userName: string;

    userEmailId: string;

    businessUnitName: string;

    dateTime: DateTime;
  }
  
  