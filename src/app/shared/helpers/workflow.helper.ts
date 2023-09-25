import { Workflow, WorkflowWithDetails } from '@shared/models/workflow.model';

export const workflowMapper = (workflows: WorkflowWithDetails[]): WorkflowWithDetails[] => {
  const vmsWorkflow = 1;

  return  workflows.map((workflow: WorkflowWithDetails) => {
    if (workflow?.type === vmsWorkflow  && workflow?.extensions ) {
      return {
        ...workflow,
        workflows: workflow.workflows?.map((flow: Workflow) => {
          return {
            ...flow,
            extensions: workflow.extensions,
            initialOrders: workflow.initialOrders,
          };
        }),
      };
    }

    return workflow;
  });
};
