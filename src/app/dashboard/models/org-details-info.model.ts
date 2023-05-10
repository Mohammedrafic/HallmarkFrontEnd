import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { AgencyPositionModel } from './agency-position.model';

export interface OrgDetailsInfoModel {
    pendingManualInvoices : number;
    pendingOrders: number;
    pendingOrganizationInvoices: number;
    pendingTimeSheets: number;
    expiringCredentialsCount: number;
    missingTimeSheet: AgencyPositionModel[];
    quickLinkNoOfLongTermOrdersInNext30Days:number;
    departmentUnAssignedEmployeeCount:number;
    workCommitmentUnAssignedEmployeeCount: number;
    id : WidgetTypeEnum.ORG;
}
