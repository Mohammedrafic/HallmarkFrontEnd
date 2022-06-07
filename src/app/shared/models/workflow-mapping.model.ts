import { PageOfCollections } from '@shared/models/page.model';
import { Step } from '@shared/models/workflow.model';

export class WorkflowMappingGet {
  mappingId: number;
  workflowName: string;
  workflowGroupId: number;
  regionId?: number;
  regionName: string;
  locationId?: number;
  locationName: string;
  departmentId?: number;
  departmentName: string;
  hasUnassignedSteps: boolean;
  skills: WorkflowSkill[];
  stepMappings: StepMapping[];
}

export class WorkflowSkill {
  skillId: number;
  skillDescription: string;
}

export class StepMapping {
  workflowStepId?: number;
  workflowType?: number;
  roleId?: number;
  userId?: string;
}

export class WorkflowMappingPost {
  mappingId?: number;
  workflowGroupId?: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  stepMappings: StepMapping[];
}

export class RoleWithUser {
  id?: string;
  name: string;
}


export class StepRoleUser {
  step: Step;
  roleUser?: RoleWithUser;
}

export type WorkflowMappingPage = PageOfCollections<WorkflowMappingGet>;
