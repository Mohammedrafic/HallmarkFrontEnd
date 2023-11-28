export interface ScheduleShift {
  id: number;
  organizationId: number;
  name: string;
  startTime: string;
  endTime: string;
  onCall: boolean;
  onCallText: string;
  inactiveDate:string;
}
