import { HttpErrorResponse } from '@angular/common/http';

import { HourOccupationType } from '../enums';
import { OverlapErrorMessageDetails, TimesheetStatisticsDetails } from '../interface';

export function getEmptyHoursOccupationData(name: string): TimesheetStatisticsDetails {
  return {
    billRateConfigName: name as HourOccupationType,
    cumulativeHours: 0,
    weekHours: 0,
    billRateConfigId: Math.random(),
  };
}

export const CreateOverlapErrorData = (err: HttpErrorResponse): OverlapErrorMessageDetails => {
  return ({
    title: err.error['detail'].split(':')[0],
    message: err.error['detail'].split(':')[1].trim(),
  });
};
