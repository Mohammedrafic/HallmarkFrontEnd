import { AlertChannel } from "@admin/alerts/alerts.enum";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { PageOfCollections } from "./page.model";
export type AlertsTemplate = {
  alertId: number;
  alertTitle:string;
  status: string;
  emailTemplateExist: boolean;
  emailTemplateId: number;
  textTemplateExist: boolean;
  textTemplateId: number;
  onScreenTemplateExist: boolean;
  onScreenTemplateId: number
};
export type EditAlertsTemplate = {
  id:number;
  alertId: number;
  alertChannel:AlertChannel;    
  businessUnitId:BusinessUnitType;    
  alertTitle:string;
  alertBody: string;
  toList: string;
  cCList: string;
  bCCList: string;
  parameters: string[];
};
export type EditAlertsTemplateRequest = {
  id:number;
  alertChannel:AlertChannel;      
  alertTitle:string;
  alertBody: string;
  toList: string;
  cCList: string;
  bCCList: string;
};
  
  export type AlertsTemplatePage = PageOfCollections<AlertsTemplate>;
  export type AlertsTemplateFilters = {
  };