import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';
import { ValueType } from '@syncfusion/ej2-angular-grids';
import { ChipItem } from '@shared/components/inline-chips';
import { ScheduleFilterFormSourceKeys } from '../constants';
import { ScheduleOrderType, ScheduleType } from '../enums';
import { IrpOrderType } from '@shared/enums/order-type';
import { Time } from '@angular/common';

export interface ScheduleDay {
  id: number;
  type: IrpOrderType | null;
  department: string | null;
  location: string | null;
  endTime: string;
  shiftDate: string;
  startTime: string;
  scheduleType: ScheduleType;
  employeeCanEdit: boolean;
}

export interface ScheduleCandidate {
  id: number;
  displayId: string;
  firstName: string;
  lastName: string;
  ltaAssignment: LtaAssignment | null;
  skill: string;
  skillId: number;
  orientationDate: string;
  dates: string[];
  orderType: IrpOrderType | null;
  workCommitments: string[] | null;
  workCommitment: string;
  days: ScheduleDay[];
  employeeNote: string;
  workHours?: number;
  isOriented: boolean;
  fullName?: string;
  workCommitmentText?: string;
  isOnHold: boolean;
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
  employeeId: number;
  scheduleOrderType: ScheduleOrderType;
  location: string;
  department: string;
  unavailabilityReason: string;
  unavailabilityReasonId: number;
  shiftId: number;
  floated: boolean;
  attributes: ScheduleItemAttributes;
  employeeCanEdit: boolean;
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

export interface ScheduleItemAttributes {
  charge: boolean;
  critical: boolean;
  onCall: boolean;
  orientated: boolean;
  preceptor: boolean;
  meal: boolean;
}

export interface ScheduleModel {
  candidate: ScheduleCandidate;
  schedule: ScheduleDateItem[];
  id: string;
}

export interface CandidateSchedules {
  employeeId: number;
  schedules: ScheduleDateItem[];
  workHours: number;
}

export interface ScheduleDateItem {
  date: string;
  extendedDays: number;
  daySchedules: ScheduleItem[];
  employeeStatus: number;
  departmentStartDate: string;
  departmentEndDate: string;
  isDisabled?: boolean;
  isOnHold: boolean;
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
export type ScheduleExportPage = PageOfCollections<ScheduleExport>;

export interface ScheduleEventConfig {
  title: string;
  color: string;
  startDate: string;
  endDate: string;
  shortTitle?: string;
  ltaOrder?: boolean;
  additionalAttributes?: string;
}

export interface DayCardConfig {
  source: ScheduleEventConfig[];
  tooltips: string[];
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
  allowNull?: boolean;
}

export interface ScheduleFilters {
  firstLastNameOrId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  skillIds?: number[];
  isAvailablity?: boolean;
  isUnavailablity?: boolean;
  isOnlySchedulatedCandidate?: boolean;
  isExcludeNotOrganized?: boolean;
  startTime? : Time | String | null;
  endTime? : Time | String | null;
  pageNumber?: number;
  pageSize?: number;
}

export interface ScheduleFiltersConfig {
  [ScheduleFilterFormSourceKeys.Regions]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.Locations]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.Departments]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.Skills]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.isAvailablity]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.isUnavailablity]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.isOnlySchedulatedCandidate]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.isExcludeNotOrganized]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.startTime]: ScheduleFilterItem;
  [ScheduleFilterFormSourceKeys.endTime]: ScheduleFilterItem;
}

export interface ScheduleFilterFormFieldConfig {
  field: string;
  title: string;
  type: FieldType;
  required: boolean;
  sourceKey: ScheduleFilterFormSourceKeys;
  showAllToggle?: boolean;
  customFiltering?: boolean;
}

export interface ScheduleFilterFormConfig {
  formClass: string;
  formFields: ScheduleFilterFormFieldConfig[];
}

export interface ScheduleFiltersData {
  filters: ScheduleFilters;
  filteredItems: FilteredItem[];
  chipsData: ChipItem[],
  skipDataUpdate?: boolean;
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
  userLocalTime: string;
  isOnlySchedulatedCandidate: boolean;
  isAvailablity: boolean;
  isUnavailablity: boolean;
  startTime: Time | String | null;
  endTime: Time | String | null;
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

export interface ShiftDropDownsData {
  filtered: boolean;
  regionsDataSource?: DropdownOption[];
  locationsDataSource: DropdownOption[];
  departmentsDataSource: DropdownOption[];
  skillsDataSource?: DropdownOption[];
  selectedSkillId: number | null;
}

export interface DeleteScheduleRequest {
  ids: number[];
  createOrder: boolean;
  startDateTime?: string;
  endDateTime?: string;
}

export interface SideBarSettings {
  isOpen: boolean;
  isEditMode: boolean;
}

export interface SelectedCells {
  cells: ScheduleSelectedSlots;
  sideBarState?: boolean;
}

export interface RemovedSlot {
  date: string | null;
  candidate: ScheduleCandidate;
}

export interface DateRangeOption {
  dateText: string;
  noBorder: boolean;
}

export interface ChipsFilterStructure {
  regionIds: number[];
  locationIds: number[];
  departmentsIds: number[];
  skillIds: number[];
}

export interface ChipsInitialState {
  regions: OrganizationLocation[];
  locations: OrganizationDepartment[];
  departments: OrganizationDepartment[];
}

export interface ChipSettings {
  editedChips: boolean;
  preservedChipsSkills: number[];
}

export interface RegionChipsStructureState {
  regionIds: number[];
  regions: OrganizationLocation[];
}

export interface LocationChipsStructureState {
  locationIds: number[];
  locations: OrganizationDepartment[];
}

export interface DepartmentChipsStructureState {
  departmentIds: number[];
  departments: OrganizationDepartment[];
}


export interface ScheduleExport {
  employeeId : number;
  displayId : number;
  firstName : string;
  lastName : string;
  skill : string;
  workCommitments :  string[];
  employeeSchedules : EmployeeSchedules;
}

export interface EmployeeSchedules {
  employeeId : number;
  workHours : number;
  schedules : Schedules[];
}

export interface Schedules {
  date : string;
  daySchedules : DaySchedules[];
}

export interface DaySchedules {
  employeeId : number;
  shiftName : number;
  date : Date;
  startDate : Date;
  endDate : Date;
  scheduleType : string;
  scheduleTypeId : number;
  orderMetadata : OrderMetaData;
  attributes : ScheduleAttributes;
}

export interface OrderMetaData {
  orderPublicId : number;
  orderType : number;
  region : string;
  location : string;
  department : string;
}

export interface ScheduleAttributes {
  orientated : boolean;
  critical : boolean;
  onCall : boolean;
  charge : boolean;
  preceptor : boolean;
  meal : boolean; 
}

