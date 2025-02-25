import {
  EditedWorkflowDto,
  WorkflowFilters,
  WorkflowFlags,
  WorkflowWithDetails,
  WorkflowWithDetailsPut,
} from "@shared/models/workflow.model";
import { WorkflowMappingPost } from '@shared/models/workflow-mapping.model';

export class GetWorkflows {
  static readonly type = '[workflow] Get Workflow list by businessUnitId';
  constructor(public payload: WorkflowFlags) {}
}

export class PreviousSelectedWorkflow {
  static readonly type = '[workflow] Get Workflow before update';
  constructor(public workflow: WorkflowWithDetails) {}
}

export class GetWorkflowsSucceed {
  static readonly type = '[workflow] Get Workflow list by businessUnitId Succeeded';
  constructor(public payload: WorkflowWithDetails[]) {}
}

export class SaveEditedWorkflow {
  static readonly type = '[workflow] Save Edited Workflow';
  constructor(public payload: EditedWorkflowDto) {}
}

export class SaveWorkflow {
  static readonly type = '[workflow] Save Workflow';
  constructor(public payload: WorkflowWithDetails) {}
}

export class SaveWorkflowSucceed {
  static readonly type = '[workflow] Save Workflow Succeeded';
  constructor() {}
}

export class UpdateWorkflow {
  static readonly type = '[workflow] Update Workflow';
  constructor(public workflow: WorkflowWithDetailsPut,
              public isRemoveStep: boolean) {}
}

export class RemoveWorkflow {
  static readonly type = '[workflow] Remove Workflow';
  constructor(public payload: WorkflowWithDetails) {}
}

export class RemoveWorkflowSucceed {
  static readonly type = '[workflow] Remove Workflow Succeed';
  constructor() {}
}

export class GetWorkflowMappingPages {
  static readonly type = '[workflow] Get Workflow Mapping Page';
  constructor(public filters?: WorkflowFilters) {}
}

export class SaveWorkflowMapping {
  static readonly type = '[workflow] Save Workflow Mapping';
  constructor(public payload: WorkflowMappingPost, public filters: WorkflowFilters) {}
}

export class UpdateWorkflowMapping {
  static readonly type = '[workflow] Update Workflow Mapping';
  constructor(public payload: WorkflowMappingPost, public filters: WorkflowFilters) {}
}

export class SaveWorkflowMappingSucceed {
  static readonly type = '[workflow] Save Workflow Mapping Succeed';
  constructor() {}
}

export class RemoveWorkflowMapping {
  static readonly type = '[workflow] Remove Workflow Mapping';
  constructor(public payload: number, public filters: WorkflowFilters) {}
}

export class RemoveWorkflowDeclined {
  static readonly type = '[workflow] Remove Workflow Declined';
  constructor() {}
}

export class GetRolesForWorkflowMapping {
  static readonly type = '[workflow] Get Roles For Workflow Mapping';
  constructor() {}
}

export class GetUsersForWorkflowMapping {
  static readonly type = '[workflow] Get Users For Workflow Mapping';
  constructor() {}
}
