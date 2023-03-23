import { DropdownOption } from '@core/interface';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';
import { ValueType } from '@syncfusion/ej2-angular-grids';
import { ChipItem } from '@shared/components/inline-chips';
import { ScheduleOrderType, ScheduleType } from '../enums';
import { IrpOrderType } from '@shared/enums/order-type';

export interface ScheduleCandidate {
  id: number;
  displayId: string;
  firstName: string;
  lastName: string;
  ltaAssignment: LtaAssignment | null;
  skill: string;
  dates: string[];
  orderType: IrpOrderType | null;
  workCommitments: string[] | null;
  employeeNote: string;
  workHours: number[];
  isOriented: boolean;
  fullName?: string;
  workCommitmentText?: string;
}

export interface LtaAssignment {
  department: string;
  endDate: string;
  location: string;
  region: string;
  startDate: string;
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
  unavailabilityReason: string;
  unavailabilityReasonId: number;
  shiftId: number;
  orderMetadata: {
    orderType: IrpOrderType;
    location: string;
    department: string;
    orderPublicId: string;
    region: string;
    primarySkill: number;
    primarySkillId: number;
    regionId: number;
    locationId: number;
    departmentId: number;
  }
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
  showWhiteFrame: boolean;
  employeeStatus: number;
  departmentStartDate: string;
  departmentEndDate: string;
  isDisabled?: boolean;
}

export interface ScheduledItem {
  candidate: ScheduleCandidate;
  schedule: ScheduleDateItem;
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

export interface ScheduleMonthCardConfig {
  title: string;
  titleColor: string;
  timeColor: string;
  showTitleToolTip?: boolean;
}

export interface ScheduleFilterItem {
  type: ControlTypes,
  dataSource: DropdownOption[],
  valueField: string;
  valueId: string;
  valueType: ValueType;
  filterTitle: string;
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

export interface ScheduleFiltersConfig {
  regionIds: ScheduleFilterItem;
  locationIds: ScheduleFilterItem;
  departmentsIds: ScheduleFilterItem;
  skillIds: ScheduleFilterItem;
}

export interface ScheduleFiltersData {
  filters: ScheduleFilters;
  filteredItems: FilteredItem[];
  chipsData: ChipItem[],
}

export interface ScheduleFilterStructure {
  regions: OrganizationRegion[];
  locations: OrganizationLocation[];
  departments: OrganizationDepartment[];
}

export interface EmployeesFilters {
  startDate: string | Date;
  endDate: string | Date;
  departmentsIds: number[];
}

export interface DatesByWeekday {
  dateSlot: string;
  active: boolean;
}

export interface CardClickEvent {
  date: string,
  candidate: ScheduleCandidate,
  cellDate?: ScheduleDateItem
}

export interface CellClickEvent {
  schedule: ScheduleDateItem,
  candidate: ScheduleCandidate,
  cellDate?: ScheduleDateItem
}
