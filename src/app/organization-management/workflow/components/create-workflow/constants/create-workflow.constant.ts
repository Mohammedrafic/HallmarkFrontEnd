import { FieldType } from '@core/enums';
import {
  CreateWorkflow,
  GroupWorkflowField,
  WorkflowField,
} from '@organization-management/workflow/interfaces/create-workflow.inteface';
import { Applicability, ApplicabilityItemType, WorkflowNavigationTabs } from '@organization-management/workflow/enumns';

export const CustomStepType = 1;
export const CustomOfferedStep = 5;
export const ApplicabilityControl = 'applicability';
export const CustomOfferedStepName = 'Offered';
export const WorkflowConfigField: WorkflowField = {
    field: 'workflow',
    title: 'Workflow',
    disabled: false,
    required: true,
    type: FieldType.Input,
};

export const ApplicabilityFields: WorkflowField[] = [
  {
    field: ApplicabilityControl,
    name: ApplicabilityControl,
    title: Applicability.Order,
    value: ApplicabilityItemType.InitialOrder,
    disabled: false,
    required: false,
    type: FieldType.RadioButton,
  },
  {
    field: ApplicabilityControl,
    name: ApplicabilityControl,
    title: Applicability.Extension,
    value: ApplicabilityItemType.Extension,
    disabled: false,
    required: false,
    type: FieldType.RadioButton,
  },
];

export const CreateDialogWorkflowConfig = (tab: WorkflowNavigationTabs, isEdit = false): CreateWorkflow => {
  return {
    title: `${isEdit ? 'Edit': 'Add'} Workflow`,
    fields: [WorkflowConfigField],
    groupFields: CreateGroupFields(tab),
  };
};

export const CreateGroupFields = (tab: WorkflowNavigationTabs): GroupWorkflowField[] => {
  if(tab === WorkflowNavigationTabs.IrpOrderWorkFlow) {
    return [];
  }

  return [{
      groupName: 'Workflow Applicability',
      required: true,
      fieldSources: ApplicabilityFields,
  }];
};
