import { FilteredItem } from '@shared/models/filter.model';
import { PageOfCollections } from '@shared/models/page.model';

import { FilterColumn } from 'src/app/dashboard/models/widget-filter.model';
import { ScheduleOrderType, ScheduleType } from '../enums';

export interface ScheduleCandidate {
  id: number;
  displayId: string;
  firstName: string;
  lastName: string;
  skill: string;
  workCommitment: string;
  employeeNote: string;
  workHours: number[];
  isOriented: boolean;
  fullName?: string;
}

export interface ScheduleItem {
  id: number;
  date: string;
  startDate: string;
  startTime: string;
  endTime: string;
  endDate: string;
  scheduleType: ScheduleType;
  orderId: number;
  scheduleOrderType: ScheduleOrderType;
  location: string;
  department: string;
  unavailabilityReason: string
}

export interface ScheduleModel {
  candidate: ScheduleCandidate;
  schedule: ScheduleDateItem[];
  id: string;
}

export interface CandidateSchedules {
  employeeId: number;
  schedules: ScheduleDateItem[];
  workHours: number[];
}

export interface ScheduleDateItem {
  date: string;
  extendedDays: number;
  daySchedules: ScheduleItem[];
  isInDifferentDepartments: boolean;
  employeeStatus: number;
  departmentStartDate: string;
  departmentEndDate: string;
  isDisabled?: boolean;
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
  startDate?: string | Date;
  endDate?: string | Date;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  skillIds?: number[];
  pageNumber?: number;
  pageSize?: number;
}

export interface ScheduleFiltersColumnsDataModel {
  regionIds: FilterColumn;
  locationIds: FilterColumn;
  departmentsIds: FilterColumn
  skillIds: FilterColumn;
}

export interface ScheduleFiltersData {
  filters: ScheduleFilters;
  filteredItems: FilteredItem[];
}
