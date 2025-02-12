import { FieldType } from '@core/enums';
import { PenaltyPayload } from '@shared/models/penalty.model';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ReasonFormType, ReasonsNavigationTabs } from '../enums';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';

export interface ReasonsFormTypesMap {
  [index: number]: ReasonFormType;
}

export interface UnavailabilityValue {
  id?: number | null;
  reason: string;
  description: string;
  calculateTowardsWeeklyHours: boolean;
  eligibleToBeScheduled: boolean;
  visibleForIRPCandidates: boolean;
  sendThroughIntegration:boolean;
}

export interface CancelEmployeeReasonValue {
  id?: number | null;
  reason: string;
}

export interface CategoryNoteValue {
  id?: number | null;
  reason: string;
  isRedFlagCategory: boolean;
  categoryName : string;
  isRedFlag?: boolean;
}

export interface InactivatedValue {
  id?: number | null;
  reason: string;
  defaultValue?: boolean;
}


export interface Closurevalue {
  id?: number | null;
  reason: string;
  includeInIRP: boolean;
  includeInVMS: boolean;
  isAutoPopulate? : boolean;
}


export type ReasonValueType = RejectReason | UnavailabilityValue | Closurevalue | CategoryNoteValue;

export interface SaveReasonParams {
  selectedTab: ReasonsNavigationTabs;
  editMode: boolean;
  formValue: ReasonValueType | PenaltyPayload;
  formType: ReasonFormType;
  allRegionsSelected?: boolean;
  allLocationsSelected?: boolean;
  forceUpsert?: boolean;
  isVMSIRP?: boolean;
  selectedSystem:SelectedSystemsFlag;
}

export interface ReasonFormConfig {
  field: string;
  title: string;
  required: boolean;
  fieldType: FieldType;
  checkBoxes?: ReasonCheckBoxGroup[];
}

export interface ReasonCheckBoxGroup {
  field: string;
  title: string;
}

export interface ReasonFormConfigMap {
  [ReasonFormType.DefaultReason]: ReasonFormConfig[];
  [ReasonFormType.Unavailability]: ReasonFormConfig[];
  [ReasonFormType.PenaltyReason]: null;
  [ReasonFormType.RequisitionReason] : ReasonFormConfig[];
  [ReasonFormType.ClosureReason] : ReasonFormConfig[];
  [ReasonFormType.CategoryNoteReason] : ReasonFormConfig[];
  [ReasonFormType.InternalTransferReason] : ReasonFormConfig[];
  [ReasonFormType.ManualInvoiceReason] : ReasonFormConfig[];
  [ReasonFormType.InactivatedReason] : ReasonFormConfig[];
  [ReasonFormType.SourcingReason] : ReasonFormConfig[];
  [ReasonFormType.RecruiterReason] : ReasonFormConfig[];
  [ReasonFormType.CancelEmployeeReasons]: ReasonFormConfig[];
}
