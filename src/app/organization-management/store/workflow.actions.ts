import { WorkflowWithDetails, WorkflowWithDetailsPut } from "@shared/models/workflow.model";
import { WorkflowMappingPost } from '@shared/models/workflow-mapping.model';

export class GetWorkflows {
  static readonly type = '[workflow] Get Workflow list by businessUnitId';
  constructor(public businessUnitId: number | null) {}
}

export class GetWorkflowsSucceed {
  static readonly type = '[workflow] Get Workflow list by businessUnitId Succeeded';
  constructor(public payload: WorkflowWithDetails[]) {}
}

export class SaveWorkflow {
  static readonly type = '[workflow] Save Workflow';
  constructor(public payload: WorkflowWithDetails) {}
}

export class UpdateWorkflow {
  static readonly type = '[workflow] Update Workflow';
  constructor(public workflow: WorkflowWithDetailsPut,
              public businessUnitId: number | null,
              public isRemoveStep: boolean) {}
}

export class RemoveWorkflow {
  static readonly type = '[workflow] Remove Workflow';
  constructor(public payload: WorkflowWithDetails) {}
}

export class GetWorkflowMappingPages {
  static readonly type = '[workflow] Get Workflow Mapping Page';
  constructor() {}
}

export class SaveWorkflowMapping {
  static readonly type = '[workflow] Save Workflow Mapping';
  constructor(public payload: WorkflowMappingPost) {}
}

export class RemoveWorkflowMapping {
  static readonly type = '[workflow] Remove Workflow Mapping';
  constructor(public payload: number) {}
}

export class RemoveWorkflowSucceed {
  static readonly type = '[workflow] Remove Workflow Succeed';
  constructor() {}
}

export class RemoveWorkflowDeclined {
  static readonly type = '[workflow] Remove Workflow Declined';
  constructor() {}
}

