import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Step, Workflow, WorkflowList, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { WorkflowStateService } from '@organization-management/workflow/services';
import {
  CustomOfferedStep,
  CustomOfferedStepName,
  CustomStepType
} from '@organization-management/workflow/components/create-workflow/constants';
import { TypeFlow } from '@organization-management/workflow/enumns';

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
    const customSteps = Object.values(stepForm.getRawValue()).flat() as Step[];

    return {
      id: id ,
      isIRP: true,
      name: name,
      customSteps,
    };
  }

  public createCustomOfferedStep(step: Step): Step {
    return {
      id: null,
      name: CustomOfferedStepName,
      status: CustomOfferedStepName,
      type: CustomOfferedStep,
      workflowId: step.workflowId ?? 0,
      formStepName: step.formStepName,
      order: 1,
    };
  }

  public getWorkflowWithCustomSteps(workflow: WorkflowList): Step[] {
    const orderWorkflowWithCustomSteps = this.getCustomSteps(
      TypeFlow.orderWorkflow,
      workflow.orderWorkflow?.steps,
    );
    const applicationWorkflowWithCustomSteps = this.getCustomSteps(
      TypeFlow.applicationWorkflow,
      workflow.applicationWorkflow?.steps,
    );

    return [...orderWorkflowWithCustomSteps, applicationWorkflowWithCustomSteps].flat();
  }

  public getDefaultWorkflowList(workflow: Workflow, type: TypeFlow): Workflow {
    return {
      ...workflow,
      steps: this.getFilteredDefaultSteps(workflow.steps, type),
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

  private getCustomSteps(type: TypeFlow, steps?: Step[]): Step[] {
    if(steps && type === TypeFlow.orderWorkflow) {
      return steps?.filter((step: Step) => {
        return step.type === CustomStepType;
      });
    }

    if(steps && type === TypeFlow.applicationWorkflow) {
      return steps?.filter((step: Step) => {
        return step.type === CustomStepType || step.type === CustomOfferedStep;
      });
    }

    return [] as Step[];
  }

  private getFilteredDefaultSteps(steps: Step[], type: TypeFlow): Step[] {
    if(type === TypeFlow.orderWorkflow) {
      return steps.filter((step: Step) => {
        return  step.type !== CustomStepType;
      });
    }

    return steps.filter((step: Step) => {
      return  step.type !== CustomStepType && step.type !== CustomOfferedStep;
    });
  }
}
