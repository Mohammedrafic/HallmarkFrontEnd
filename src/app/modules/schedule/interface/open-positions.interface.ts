import { ScheduleModel } from './schedule.interface';

export interface OpenPositionParams {
  departmentId: number;
  skillId: number;
  startDate?: string;
  endDate?: string;
  selectedDates?: string[];
}

export interface OpenPositionsList {
  date: string;
  totalOpenPositions: number;
  positions: Positions[];
}

export interface Positions {
  critical: boolean
  onCall: boolean
  openPositions: number;
  orderId: number;
  publicId: string;
  shiftEndTime: string;
  shiftId: number;
  shiftStartTime: string;
  attributes: string;
}

export interface OpenPositionState {
  initialPositions: OpenPositionsList[];
  shiftTime: string | null;
}

export interface PositionDragEvent {
  action: boolean;
  date: string | null;
  candidateId: number | null;
}

export interface DroppedEvent {
  dateItem: string;
  scheduleItem: ScheduleModel;
}
