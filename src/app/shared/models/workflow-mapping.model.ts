import { PageOfCollections } from '@shared/models/page.model';

export class WorkflowMappingGet {
  mappingId: number;
  workflowName: string;
  workflowGroupId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  hasUnassignedSteps: boolean;
  skills: WorkflowSkill[];
  stepMappings: StepMappings[];
}

export class WorkflowSkill {
  skillId: number;
  skillDescription: string;
}

export class StepMappings {
  workflowStepId: number;
  workflowType?: number;
  roleId: number;
  userId: string;
}

export class WorkflowMappingPost {

  mappingId?: number;
  workflowGroupId: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  stepMappings: StepMappings[];
}

export type WorkflowMappingPage = PageOfCollections<WorkflowMappingGet>;
