import { BusinessUnitType } from './../enums/business-unit-type';
import { AlertChannel } from "@admin/alerts/alerts.enum";
import { DateTime } from "@syncfusion/ej2-angular-charts";
import { Alert } from "./alerts-template.model";
import { PageOfCollections } from "./page.model";

export type UserSubscription = {
  alertId: number;
  alert: Alert;
  userId:string;
  isEmailEnabled: boolean;
  isSMSEnabled: boolean;
  isOnScreenEnabled: boolean;
  CreatedBy?:string;
  CreatedAt:DateTime;  
};
export type UserSubscriptionRequest = {
  alertId:number,
  userId:string,
  alertChannel:AlertChannel,
  enabled:boolean,
  businessUnitType?:BusinessUnitType,
  isIRP?:boolean
};
export type UserSubscriptionPage = PageOfCollections<UserSubscription>;
export type UserSubscriptionFilters = {
};
