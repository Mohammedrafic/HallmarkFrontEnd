import { WidgetTypeEnum } from '../enums/widget-type.enum';

export interface OrgDetailsInfoModel {
    pendingManualInvoices : number;
    pendingOrders: number;
    pendingOrganizationInvoices: number;
    pendingTimeSheets: number;
    id : WidgetTypeEnum.ORG;
}
