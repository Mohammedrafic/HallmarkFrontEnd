import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { AgencyPositionModel } from './agency-position.model';

export interface RnUtilizationModel {
    pendingManualInvoices : number;
    pendingOrders: number;
    pendingOrganizationInvoices: number;
    pendingTimeSheets: number;
    expiringCredentialsCount: number;
    missingTimeSheet: AgencyPositionModel[];
    id : WidgetTypeEnum.RN_UTILIZATION;
}
