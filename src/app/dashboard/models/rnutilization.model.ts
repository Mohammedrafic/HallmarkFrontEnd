import { WidgetTypeEnum } from '../enums/widget-type.enum';

export interface RnUtilizationModel {
    monthlyTotalHoursSchedule:number;
    noOfPerdiemNursing: number;
    perdayTotalHoursSchedule: number;
    targetPerdiemNursingHours:number;
    id : WidgetTypeEnum.RN_UTILIZATION;
}
