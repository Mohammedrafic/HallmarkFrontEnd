import { TimesheetTargetStatus } from '../enums';

export interface ChangeStatusData {
  timesheetId: number;
  organizationId: number | null;
  targetStatus: TimesheetTargetStatus;
  reason: string | null;
}
