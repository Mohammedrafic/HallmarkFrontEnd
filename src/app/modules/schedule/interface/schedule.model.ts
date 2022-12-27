import { ScheduleCandidateType, ScheduleOrderType, ScheduleType } from '../enums';

export interface ScheduleCandidate {
  firstName: string;
  lastName: string;
  id: string;
  direction: string;
  date: string;
  text: string;
  type: ScheduleCandidateType;
}

export interface ScheduleItem {
  id: string;
  date: string;
  startDate: string;
  endDate: string;
  type: ScheduleType;
  orderId: number;
  orderType: ScheduleOrderType;
  location?: string;
  department?: string;
  isInDifferentDepartments?: boolean;
}

export interface ScheduleModel {
  candidate: ScheduleCandidate;
  schedule: ScheduleItem[];
  id: number;
}

export interface ScheduleCardConfig {
  title: string;
  iconName: string;
  bgColor: string;
  iconColor: string;
  isLocDep?: boolean;
}
