import { useractivitlogreportPage } from "@shared/models/userlog-activity.model";

export class GetuserlogReportPage {
  static readonly type = '[Custom Report] Get Userlog Report Page';
  constructor(public payload: useractivitlogreportPage){}

}


