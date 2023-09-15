import { FieldType } from '@core/enums';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';

export interface CreateWorkflow {
  title: string;
  fields: WorkflowField[];
  groupFields: GroupWorkflowField[];
}

export interface GroupWorkflowField {
  groupName: string;
  required: boolean;
  fieldSources: WorkflowField[];
}

export interface WorkflowField {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
}

export interface WorkflowTypeList {
  id: WorkflowGroupType;
  text: string;
}

export interface WorkflowTabName {
  vmsWorkflow: string;
  irpWorkflow: string;
  mapping: string;
}

export interface WorkFlowFilterOption {
  name: string;
  id: number;
}

export interface SystemFlags {
  isIRPEnabled: boolean;
  isVMCEnabled: boolean;
}
