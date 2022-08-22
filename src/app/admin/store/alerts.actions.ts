import { AlertChannel } from "@admin/alerts/alerts.enum";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { AlertsTemplateFilters } from "@shared/models/alerts-template.model";
import { UserSubscriptionFilters } from "@shared/models/user-subscription.model";

export class GetUserSubscriptionPage {
    static readonly type = '[alerts] Get User Subscription Page';
    constructor(
      public businessUnitType: BusinessUnitType,
      public businessUnitIds: number[],
      public pageNumber: number,
      public pageSize: number,
      public sortModel: any,
      public filterModel: any,
      public filters: UserSubscriptionFilters
    ) {}
  }
  export class GetAlertsTemplatePage {
    static readonly type = '[alerts] Get Templates Page';
    constructor(
      public bussinessUnitType:BusinessUnitType,
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
      public alertChannelId: AlertChannel
    ) {}
  }