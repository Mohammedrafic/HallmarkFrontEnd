import { PageOfCollections } from '@shared/models/page.model';
import { Step } from '@shared/models/workflow.model';
import { User } from '@shared/models/user-managment-page.model';
import { WorkflowType } from '@shared/enums/workflow-type';

export interface WorkflowMappingGet {
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
  workflowGroupType: number;
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
  isPermissionBased?: boolean;
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

export class WorkflowByDepartmentAndSkill {
  workflowGroupId: number;
  workflowGroupName: string;
}

export interface RolesByPermission {
  type: number;
  roles: RoleWithUser[];
  workflowType: WorkflowType;
}

export interface UsersByPermission {
  type: number;
  users: User[];
  workflowType: WorkflowType;
}

export type WorkflowMappingPage = PageOfCollections<WorkflowMappingGet>;
