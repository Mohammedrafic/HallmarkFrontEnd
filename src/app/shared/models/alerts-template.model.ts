import { AlertChannel } from "@admin/alerts/alerts.enum";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
export class AlertsTemplate  {
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
export class EditAlertsTemplate {
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
export class EditAlertsTemplateRequest  {
  id:number;
  alertChannel:AlertChannel;      
  alertTitle:string;
  alertBody: string;
  toList: string;
  cCList: string;
  bCCList: string;
};
  
  
  export class AlertsTemplateFilters {
  };
  export class AlertsTemplatePage {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: AlertsTemplate[];
    pageNumber: number;
    totalCount: number;
    totalPages: number;
  }

export class Alert{
    id :number;
    alertTitle:string;
    alertTypeId:number;
    hallmark:boolean;
    mSP:boolean;
    organization:boolean;
    agency:boolean;
    isDeleted:boolean;
}