import { FieldType } from '@core/enums';
import { CreateWorkflow } from '@organization-management/workflow/interfaces/create-workflow.inteface';

export const CustomStepType = 1;
export const WorkflowDialogConfig: CreateWorkflow = {
  title: 'Add Workflow',
  fields: [
    {
      field: 'workflow',
      title: 'Workflow',
      disabled: false,
      required: true,
      type: FieldType.Input,
    },
  ],
};
