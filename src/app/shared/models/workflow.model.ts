export class WorkflowWithDetails {
  id?: number;
  name: string;
  type: number;
  workflows?: Workflow[];
  isActive?: boolean; // used only on UI to highlight clicked card
}

export class WorkflowWithDetailsPut {
  id?: number;
  name: string;
  customSteps: Step[];
}

export class Workflow {
  id?: number;
  type: number;
  steps: Step[];
}

export class Step {
  id?: number;
  canBeFollowedByCustomStep?: boolean;
  isAgencyStep?: boolean;
  requirePermission?: boolean;
  workflowId?: number;
  name: string;
  status: string;
  type: number;
  order?: number;
  nextStepStatus?: string;
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
