import { TIMETHEETS_STATUSES } from '../enums';

export const getTimesheetStatusFromIdx = (idx: number): TIMETHEETS_STATUSES | string => {
  return idx === 1 ? TIMETHEETS_STATUSES.PENDING_APPROVE :
    idx === 2 ? TIMETHEETS_STATUSES.MISSING :
      idx === 3 ? TIMETHEETS_STATUSES.REJECTED :
        '';
}
