import { AlertChannel } from "@admin/alerts/alerts.enum";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { AddAlertsTemplateRequest, AlertsTemplateFilters, AlertTriggerDto, DismissAlertDto, EditAlertsTemplateRequest } from "@shared/models/alerts-template.model";
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
      public filters: AlertsTemplateFilters
    ) {}
  }

  export class GetTemplateByAlertId {
    static readonly type = '[alerts] Get Template By AlertId';
    constructor(
      public alertId:number,
      public alertChannel: AlertChannel,
      public businessUnitId:number |null
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