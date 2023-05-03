import { AlertChannel } from "@admin/alerts/alerts.enum";
import { CommonReportFilter } from "@admin/analytics/models/common-report.model";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { AddAlertsTemplateRequest, AlertsTemplateFilters, AlertTriggerDto, DismissAlertDto, EditAlertsTemplateRequest } from "@shared/models/alerts-template.model";
import { GroupEmailFilters, SendGroupEmailRequest } from "@shared/models/group-email.model";
import { UserSubscriptionFilters, UserSubscriptionRequest } from "@shared/models/user-subscription.model";

export class GetUserSubscriptionPage {
    static readonly type = '[alerts] Get User Subscription Page';
    constructor(
      public businessUnitType: BusinessUnitType,
      public userId: string,
      public pageNumber: number,
      public pageSize: number,
      public sortModel: any,
      public filterModel: any,
      public filters: UserSubscriptionFilters
    ) {}
  }
  export class UpdateUserSubscription {
    static readonly type = '[alerts] Update User Subscription';
    constructor(     
      public userSubscriptionRequest:UserSubscriptionRequest
    ) {}
  }
  export class GetAlertsTemplatePage {
    static readonly type = '[alerts] Get Templates Page';
    constructor(
      public businessUnitType:BusinessUnitType,
      public businessUnitId:number |null,
      public pageNumber: number,
      public pageSize: number,
      public sortModel: any,
      public filterModel: any,
      public filters: AlertsTemplateFilters,
      public isIRP: boolean
    ) {}
  }

  export class GetTemplateByAlertId {
    static readonly type = '[alerts] Get Template By AlertId';
    constructor(
      public alertId:number,
      public alertChannel: AlertChannel,
      public businessUnitId:number |null,
      public businessUnitType:number | null,
      public isIRP: boolean
    ) {}
  }
  export class UpdateTemplateByAlertId {
    static readonly type = '[alerts] Update Template By AlertId';
    constructor(
      public editAlertsTemplateRequest:EditAlertsTemplateRequest 
    ) {}
}
export class SaveTemplateByAlertId {
  static readonly type = '[alerts] Save Template By AlertId';
  constructor(
    public addAlertsTemplateRequest: AddAlertsTemplateRequest
  ) { }
}
export class AlertTrigger {
  static readonly type = '[alerts] Create Order Alert Trigger';
  constructor(
    public alertTriggerDto: AlertTriggerDto
  ) {}
}
export class DismissAlert {
  static readonly type = '[alerts] Dismiss Alert';
  constructor(
    public model: DismissAlertDto
  ){}
}
export class DismissAllAlerts {
  static readonly type = '[alerts] Dismiss All Alerts';
  constructor(){}
}
export class ClearAlertTemplateState {
  static readonly type = '[alerts] Clear Alert Template State';
  constructor(){}
}
export class GetGroupMailByBusinessUnitIdPage {
  static readonly type = '[groupemail] GetGroupMailByBusinessUnitId';
  constructor(
    public businessUnitId: number|null,
    public getAll:boolean
  ) {}
}
export class SendGroupEmail {
  static readonly type = '[groupemail] Send Group Email';
  constructor(
    public sendGroupEmailRequest: SendGroupEmailRequest
  ) { }
}
export class GetGroupEmailById {
  static readonly type = '[groupemail] Get Group Email By Id';
  constructor(
    public id: number
  ) { }
}
export class GetGroupEmailRoles {
  static readonly type = '[groupemail] Get Group Email roles By organization id';
  constructor(
    public id: number
  ) { }
}

export class GetGroupEmailInternalUsers {
  static readonly type = '[groupemail] Get Group Email Users By region id, location id and roles';
  constructor(
    public regionIds: string,
    public locationIds: string,
    public roles: string,
    public businessUnitIds: string,
    public forAgency: boolean
  ) { }
}

export class GetGroupEmailAgencies {
  static readonly type = '[groupemail] Get Group Email Agencies by business unit';
  constructor(
    public businessUnitId: number
  ) { }
}

export class GetGroupEmailSkills {
  static readonly type = '[groupemail] Get Group Email skills by business unit';
  constructor(
    public businessUnitId: number,
    public isAgency: number
  ) { }
}

export class GetGroupEmailCandidateStatuses {
  static readonly type = '[groupemail] Get Group Email candidate statuses by business unit';
  constructor(
    public businessUnitId: number
  ) { }
}


export class GetDocumentPreviewDeatils {
  static readonly type = '[groupemail] Get document preview details';
  constructor(public id: any) { }
}

export class GetDocumentPreviewDeatilsSucceeded {
  static readonly type = '[groupemail] Get document preview details Succeeded';
  constructor(public documentPreviewDetail: any) { }
}

export class GetDocumentDownloadDeatils {
  static readonly type = '[groupemail] Get document download details';
  constructor(public id: any) { }
}

export class GetDocumentDownloadDeatilsSucceeded {
  static readonly type = '[groupemail] Get document download details Succeeded';
  constructor(public documentDownloadDetail: any) { }
}


export class GetGroupEmailCandidates {
  static readonly type = '[groupemail] Get Group Email candidates by criteria';
  constructor(
    public agencies: string,
    public skills: string,
    public regions: string,
    public locations: string,
    public orderTypes: string,
    public statuses: string,
    public jobID: string,
    public isAgency: boolean,
    public businessUnitIds: string
  ) { }
}

export class Toaster{
  static readonly type = "User Subscription CatchError";
  constructor(){}
}

export class GetGroupEmailDepartmentSkills {
  static readonly type = '[groupemail] Get Group Email department skills';
  constructor(
    public departmentIds: string,
    public businessUnitId: number
  ) { }
}

export class GetGroupEmailEmployees {
  static readonly type = '[groupemail] Get Group Email employees by criteria';
  constructor(
    public businessUnitId: number,    
    public regions: string,
    public locations: string,
    public departments: string,
    public skills: string,
    public workCommitments: string,
    public orientationComplete: boolean
  ) { }
}

export class GetStaffScheduleReportFilterOptions{
  static readonly type = '[LogiReport] Get Staff Schedule Report Filter Options';
  constructor(public filter: CommonReportFilter) { }
}