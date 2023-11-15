import { FieldType } from '@core/enums';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import { Applicability, ApplicabilityItemType } from '@organization-management/workflow/enumns';

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
  name?: string;
  value?: ApplicabilityItemType;
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

export interface ApplicabilitySourceList {
  name: Applicability;
  id: ApplicabilityItemType;
}

export interface ApplicabilityFieldsConfig {
  showField: boolean;
  sources: ApplicabilitySourceList[];
}
