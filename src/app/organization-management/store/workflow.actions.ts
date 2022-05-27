import { WorkflowWithDetails, WorkflowWithDetailsPut } from "@shared/models/workflow.model";

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
              public businessUnitId: number | null) {}
}

export class RemoveWorkflow {
  static readonly type = '[workflow] Remove Workflow';
  constructor(public payload: WorkflowWithDetails) {}
}
