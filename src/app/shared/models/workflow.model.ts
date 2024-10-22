import { WorkflowStepType } from '@shared/enums/workflow-step-type';

export class WorkflowWithDetails {
  id?: number;
  name: string;
  type: number;
  initialOrders: boolean;
  extensions: boolean;
  requireMappingsUpdate?: boolean;
  workflows?: Workflow[];
  isIRP: boolean;
  cardInfo?: string;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  isActive?: boolean; // used only on UI to highlight clicked card
}

export interface EditedWorkflowDto {
  id: number;
  name: string;
  initialOrders: boolean;
  extensions: boolean;
  isIRP: boolean;
}

export interface WorkflowWithDetailsPut {
  id?: number;
  name: string;
  isIRP: boolean;
  customSteps: Step[];
}

export interface Workflow {
  id?: number;
  type: number;
  extensions: boolean;
  initialOrders: boolean;
  workflowId: number;
  steps: Step[];
}

export interface Step {
  id?: number | null;
  canBeFollowedByCustomStep?: boolean;
  isAgencyStep?: boolean;
  requirePermission?: boolean;
  workflowId?: number;
  name: string;
  status: string;
  type: WorkflowStepType;
  formStepName?: string;
  order?: number;
  nextStepStatus?: string;
  roleFieldDataSourceType?: WorkflowStepType;
  nextStepId?: number | null;
  parentId?: number | null;
  multiple?: string | null;
  includeInIrp?: boolean;
}

export class WorkflowFilters {
  holidayNames?: string[];
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  skillIds?: number[];
  types?: number[];
  names?: string[];
  workflowApplicability?: string[];
  applicability?: FiltersApplicability;
}

export interface FiltersApplicability {
  initialOrders: boolean;
  extensions: boolean;
}

export interface WorkflowFlags {
  includeInIRP: boolean;
  includeInVMS: boolean;
}

export interface WorkflowList {
  orderWorkflow: Workflow | null;
  applicationWorkflow: Workflow | null;
}
