import { FieldType } from '@core/enums';
import {
  CreateWorkflow,
  GroupWorkflowField,
  WorkflowField,
} from '@organization-management/workflow/interfaces/create-workflow.inteface';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';

export const CustomStepType = 1;
export const CustomOfferedStep = 5;
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
    field: 'initialOrders',
    title: 'Initial Order',
    disabled: false,
    required: false,
    type: FieldType.CheckBox,
  },
  {
    field: 'extensions',
    title: 'Extensions',
    disabled: false,
    required: false,
    type: FieldType.CheckBox,
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
