import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { Store } from '@ngxs/store';
import { filter, map, take, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { WorkflowStateService } from '@organization-management/workflow/services';
import { Step, Workflow, WorkflowList, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { WorkflowStepsService } from '@organization-management/workflow/components/workflow-steps-list/services';
import { JobOrderService } from '@organization-management/workflow/job-order/services';
import { UpdateWorkflow } from '@organization-management/store/workflow.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { TypeFlow } from '@organization-management/workflow/enumns';
import {
  CustomOfferedStep,
  CustomOfferedStepName,
} from '@organization-management/workflow/components/create-workflow/constants';

@Component({
  selector: 'app-workflow-steps-list',
  templateUrl: './workflow-steps-list.component.html',
  styleUrls: ['./workflow-steps-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStepsListComponent extends Destroyable implements OnInit {
  @Input() userPermission: Permission;

  public customStepsForm: FormGroup;
  public isShortlistedStepAdded = false;
  public workflowsList: WorkflowList = {
    orderWorkflow: null,
    applicationWorkflow: null,
  };

  public readonly userPermissions = UserPermissions;
  public readonly typeFlowList = TypeFlow;

  constructor(
    private workflowStateService: WorkflowStateService,
    private workflowStepsService: WorkflowStepsService,
    private cdr: ChangeDetectorRef,
    private jobOrderService: JobOrderService,
    private store: Store,
    private confirmService: ConfirmService
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

  public removeCustomStep(index: number, controlName: string, typeFlow: TypeFlow): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
      filter(confirm => !!confirm),
      take(1)
    ).subscribe(() => {
      const control = this.customStepsForm.controls[controlName] as FormArray;
      control.removeAt(index);

      if(typeFlow === TypeFlow.applicationWorkflow) {
        this.isShortlistedStepAdded = false;
      }

      this.updateSteps(true);
    });
  }

  public createCustomStepForApplication(step: Step): void {
    this.isShortlistedStepAdded = true;

    const offeredStep = this.workflowStepsService.createCustomOfferedStep(step);

    this.workflowStepsService.createStepControl(this.customStepsForm, offeredStep, true);
    this.customStepsForm.controls[offeredStep.formStepName as string]?.disable();

    this.cdr.markForCheck();
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
    if (!this.customStepsForm.invalid) {
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
      this.isShortlistedStepAdded = false;

      this.workflowsList = {
        orderWorkflow: this.workflowStepsService.getDefaultWorkflowList(
          workflow.orderWorkflow as Workflow,
          this.typeFlowList.orderWorkflow
        ),
        applicationWorkflow: this.workflowStepsService.getDefaultWorkflowList(
          workflow.applicationWorkflow as Workflow,
          this.typeFlowList.applicationWorkflow
        ),
      };
      const workflowWithCustomSteps = this.workflowStepsService.getWorkflowWithCustomSteps(workflow);

      this.initStepsForm();

      if(workflowWithCustomSteps.length) {
        workflowWithCustomSteps.forEach((step: Step) => {
          this.createCustomStep(step, true);
        });

        this.disableApplicationOfferedStep(workflowWithCustomSteps);
      }
      this.cdr.markForCheck();
    });
  }

  private disableApplicationOfferedStep(workflowWithCustomSteps: Step[]): void {
    const offeredCustomStep = workflowWithCustomSteps.filter((step: Step) => {
      return step.type === CustomOfferedStep && step.name === CustomOfferedStepName && step.status === CustomOfferedStepName;
    });
    offeredCustomStep?.forEach((step: Step) => {
      this.customStepsForm.controls[step.formStepName as string]?.disable();
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
