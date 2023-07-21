export class WorkflowWithDetails {
  id?: number;
  name: string;
  type: number;
  requireMappingsUpdate?: boolean;
  workflows?: Workflow[];
  isIRP: boolean;
  includeInIRP?: boolean;
  isActive?: boolean; // used only on UI to highlight clicked card
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
  workflowId: number;
  steps: Step[];
}

export interface Step {
  id?: number;
  canBeFollowedByCustomStep?: boolean;
  isAgencyStep?: boolean;
  requirePermission?: boolean;
  workflowId?: number;
  name: string;
  status: string;
  type: number;
  formStepName?: string;
  order?: number;
  nextStepStatus?: string;
  parentId?: number | null;
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
}

export interface WorkflowFlags {
  includeInIRP: boolean;
  includeInVMS: boolean;
}

export interface WorkflowList {
  orderWorkflow: Workflow | null;
  applicationWorkflow: Workflow | null;
}
