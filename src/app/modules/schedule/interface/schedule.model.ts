import { ScheduleOrderType, ScheduleType } from '../enums';
import { PageOfCollections } from '@shared/models/page.model';

export interface ScheduleCandidate {
  id: number;
  firstName: string;
  lastName: string;
  skill: string;
  workCommitment: string;
  employeeNote: string;
  workHours: number[];
  isOriented: boolean;
}

export interface ScheduleItem {
  id: number;
  date: string;
  startDate: string;
  endDate: string;
  scheduleType: ScheduleType;
  orderId: number;
  scheduleOrderType: ScheduleOrderType;
  location: string;
  department: string;
}

export interface ScheduleModel {
  candidate: ScheduleCandidate;
  schedule: ScheduleDateItem[];
  id: string;
}

export interface CandidateSchedules {
  employeeId: number;
  schedules: ScheduleDateItem[];
}

export interface ScheduleDateItem {
  date: string;
  extendedDays: number;
  daySchedules: ScheduleItem[];
  isInDifferentDepartments: boolean;
}

export interface ScheduleDateSlot {
  candidate: ScheduleCandidate;
  dates: Set<string>;
}

export interface ScheduleSelectedSlots {
  candidates: ScheduleCandidate[];
  dates: string[];
}

export type ScheduleCandidatesPage = PageOfCollections<ScheduleCandidate>;
export type ScheduleModelPage = PageOfCollections<ScheduleModel>;

export interface ScheduleCardConfig {
  title: string;
  iconName: string;
  bgColor?: string;
  iconColor?: string;
  showTitleToolTip?: boolean;
}

export interface ScheduleFilters {
  firstLastNameOrId?: string;
  startDate?: string;
  endDate?: string;
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  skillIds?: number[];
  pageNumber?: number;
  pageSize?: number;
}
