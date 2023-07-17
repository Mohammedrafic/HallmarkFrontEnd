import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Step, Workflow, WorkflowList, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { CustomStepType } from '@organization-management/workflow/components/create-workflow/constants';

@Injectable()
export class WorkflowStepsService {
  constructor(
    private formBuilder: FormBuilder,
    private workflowStateService: WorkflowStateService,
    ) {}

  public createCustomWorkflowForm(): FormGroup {
    return this.formBuilder.group({});
  }

  public createStepControl(form: FormGroup, step: Step, isCustomStep: boolean): void {
    form.addControl(step.formStepName as string, this.formBuilder.array([
      this.createStepForm(form, step, isCustomStep),
    ]));
  }

  public createStepForm(form: FormGroup, step: Step, isCustomStep: boolean): FormGroup {
    const countSteps = form.value[step.formStepName as string]?.length ?? 0;

    return this.formBuilder.group({
      id: isCustomStep ? step.id : null,
      name: [isCustomStep ? step.name : '', [Validators.required, Validators.maxLength(50)]],
      status: [isCustomStep ? step.status : '', [Validators.required, Validators.maxLength(50)]],
      type: isCustomStep ? step.type : CustomStepType,
      workflowId: [isCustomStep ? step.workflowId : step.workflowId],
      order: countSteps + 1,
    });
  }

  public createWorkflowDetailsDto(stepForm: FormGroup): WorkflowWithDetailsPut {
    const {id, name} = this.workflowStateService.getSelectedCard() as WorkflowWithDetails;
    const customSteps = Object.values(stepForm.value).flat() as Step[];

    return {
      id: id ,
      isIRP: true,
      name: name,
      customSteps,
    };
  }

  public getWorkflowWithCustomSteps(workflow: WorkflowList): Step[] {
    const orderWorkflowWithCustomSteps = this.getCustomSteps(workflow.orderWorkflow?.steps);
    const applicationWorkflowWithCustomSteps = this.getCustomSteps(workflow.applicationWorkflow?.steps);

    return [...orderWorkflowWithCustomSteps, applicationWorkflowWithCustomSteps].flat();
  }

  public getDefaultWorkflowList(workflow: Workflow): Workflow {
    return {
      ...workflow,
      steps: workflow.steps.filter((step: Step) => step.type !== CustomStepType),
    };
  }

  public prepareWorkflowList(workflow: WorkflowWithDetails): WorkflowList | null {
    if(workflow && workflow.workflows?.length) {
      return {
        orderWorkflow: this.mapWorkflowStructure(workflow?.workflows[0], workflow.id as number),
        applicationWorkflow: this.mapWorkflowStructure(workflow?.workflows[1], workflow.id as number),
      };
    }

    return null;
  }

  private mapWorkflowStructure(workflows: Workflow, workflowId: number): Workflow {
    return {
      ...workflows,
      workflowId,
      steps: workflows.steps.map((step: Step) => {
        return {
          ...step,
          formStepName: `step${step.parentId ?? step.id}`,
        };
      }),
    };
  }

  private getCustomSteps(steps?: Step[]): Step[] {
    if(steps) {
      return steps?.filter((step: Step) => {
        return step.type === CustomStepType;
      });
    }
    return [] as Step[];
  }
}
