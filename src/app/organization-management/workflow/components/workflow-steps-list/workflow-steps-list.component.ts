import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { Store } from '@ngxs/store';
import { filter, map, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { Step, Workflow, WorkflowList, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { WorkflowStepsService } from '@organization-management/workflow/components/workflow-steps-list/services';
import { JobOrderService } from '@organization-management/workflow/job-order/services';
import { UpdateWorkflow } from '@organization-management/store/workflow.actions';

@Component({
  selector: 'app-workflow-steps-list',
  templateUrl: './workflow-steps-list.component.html',
  styleUrls: ['./workflow-steps-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStepsListComponent extends Destroyable implements OnInit {
  @Input() userPermission: Permission;

  public customStepsForm: FormGroup;
  public workflowsList: WorkflowList = {
    orderWorkflow: null,
    applicationWorkflow: null,
  };

  public readonly userPermissions = UserPermissions;

  constructor(
    private workflowStateService: WorkflowStateService,
    private workflowStepsService: WorkflowStepsService,
    private cdr: ChangeDetectorRef,
    private jobOrderService: JobOrderService,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForSelectCard();
    this.initStepsForm();
    this.watchForUpdateAction();
  }

  trackByWorkflow(idx: number, workflowStep: Step): string {
    return workflowStep.formStepName as string;
  }

  trackByStep(idx: number, step: Step): string {
    return step.order as unknown as string;
  }

  public removeCustomStep(index: number, controlName: string): void {
    const control = this.customStepsForm.controls[controlName] as FormArray;
    control.removeAt(index);
    this.updateSteps(true);
  }


  public createCustomStep(step: Step, isCustomStep = false): void {
    const stepControl = this.customStepsForm?.controls[step.formStepName as string];

    if(stepControl) {
      const steps = this.customStepsForm.controls[step.formStepName as string] as FormArray;
      const stepsForm = this.workflowStepsService.createStepForm(this.customStepsForm, step, isCustomStep);
      steps.push(stepsForm);
    } else {
      this.workflowStepsService.createStepControl(this.customStepsForm, step, isCustomStep);
    }

    this.cdr.markForCheck();
  }

  private watchForUpdateAction(): void {
    this.jobOrderService.updateWorkflowStepsAction.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.updateSteps();
    });
  }

  private updateSteps(isRemoveStep = false): void {
    if(this.customStepsForm.valid) {
      const workflowWithDetailsPut: WorkflowWithDetailsPut = this.workflowStepsService.createWorkflowDetailsDto(
        this.customStepsForm
      );

      this.store.dispatch(new UpdateWorkflow(workflowWithDetailsPut, isRemoveStep));
      return;
    }

    this.customStepsForm.markAllAsTouched();
    this.cdr.markForCheck();
  }

  private watchForSelectCard(): void {
    this.workflowStateService.getCardStream().pipe(
      map((workflow: WorkflowWithDetails | null) => {
        return this.setWorkflowList(workflow);
      }),
      filter((workflow: WorkflowWithDetails | null): workflow is WorkflowWithDetails => !!workflow),
      map((workflow: WorkflowWithDetails) => this.workflowStepsService.prepareWorkflowList(workflow)),
      filter((workflow: WorkflowList | null): workflow is WorkflowList => !!workflow),
      takeUntil(this.componentDestroy())
    ).subscribe((workflow: WorkflowList) => {
      this.workflowsList = {
        orderWorkflow: this.workflowStepsService.getDefaultWorkflowList(workflow.orderWorkflow as Workflow),
        applicationWorkflow: this.workflowStepsService.getDefaultWorkflowList(workflow.applicationWorkflow as Workflow),
      };

      const workflowWithCustomSteps = this.workflowStepsService.getWorkflowWithCustomSteps(workflow);

      if(workflowWithCustomSteps.length) {
        this.initStepsForm();
        workflowWithCustomSteps.forEach((step: Step) => {
          this.createCustomStep(step, true);
        });
      }
      this.cdr.markForCheck();
    });
  }

  private setWorkflowList(workflow: WorkflowWithDetails | null): WorkflowWithDetails | null {
    if (!workflow) {
      this.workflowsList = {
        orderWorkflow: null,
        applicationWorkflow: null,
      };

      this.cdr.markForCheck();
    }

    return workflow;
  }

  private initStepsForm(): void {
    this.customStepsForm = this.workflowStepsService.createCustomWorkflowForm();
  }
}
