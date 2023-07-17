import { WorkflowFlags, WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowMappingGet, WorkflowMappingPage } from '@shared/models/workflow-mapping.model';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import { WorkflowTabNames } from '@organization-management/workflow/workflow-mapping/constants';

export const GetSelectedCardIndex = (workflowDetails: WorkflowWithDetails[], cardId: number): number => {
  return workflowDetails.findIndex((workflows: WorkflowWithDetails) => {
    return workflows.id === cardId;
  });
};

export const GetWorkflowFlags = (isIRP: boolean): WorkflowFlags => {
  return {
    includeInVMS: !isIRP,
    includeInIRP: isIRP,
  };
};

export const PrepareWorkflowMapping = (mapping: WorkflowMappingPage): WorkflowMappingPage => {
  return {
    ...mapping,
    items: mapping.items.map((item: WorkflowMappingGet) => {
      const workflowGroupName = item.workflowGroupType === WorkflowGroupType.IRPOrderWorkflow ?
        WorkflowTabNames.irpWorkflow : WorkflowTabNames.vmsWorkflow;

      return {
        ...item,
        workflowGroupName,
      };
    }),
  };
};
