import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowSideDialog } from '../../../store/app.actions';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import {
  GetRolesForWorkflowMapping,
  GetUsersForWorkflowMapping,
  GetWorkflowMappingPages,
  GetWorkflows,
  GetWorkflowsSucceed,
  RemoveWorkflow,
  SaveWorkflow,
  UpdateWorkflow
} from '../../store/workflow.actions';
import { Step, Workflow, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { ActivatedRoute } from '@angular/router';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { UserState } from '../../../store/user.state';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { AbstractPermission } from '@shared/helpers/permissions';

export enum WorkflowNavigationTabs {
  JobOrderWorkflow,
  WorkflowMapping
}

@Component({
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
  styleUrls: ['./job-order.component.scss']
})
export class JobOrderComponent extends AbstractPermission implements OnInit, OnDestroy {
  public isJobOrderWorkflowTabActive = true;
  public isWorkflowMappingTabActive = false;
  public workflowsWithDetails: WorkflowWithDetails[] = [];
  public workflowFormGroup: FormGroup;
  public customStepOrderFormGroup: FormGroup;
  public customStepApplicationFormGroup: FormGroup;

  public selectedCard?: WorkflowWithDetails;
  public orderWorkflow: Workflow;
  public applicationWorkflow: Workflow;

  public customOrderSteps$: Subject<Step[]> = new Subject<Step[]>();
  public customApplicationSteps$: Subject<Step[]> = new Subject<Step[]>();

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  private formBuilder: FormBuilder;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private actions$: Actions,
              protected override store: Store,
              private route: ActivatedRoute,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super(store);
    this.formBuilder = builder;
    this.createWorkflowFormGroup();
    this.createCustomOrderStepFormGroup();
    this.createCustomApplicationStepFormGroup();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.organizationId$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe(() => {
      this.store.dispatch(new GetWorkflows());
      this.selectedCard = undefined;
    });

    this.store.dispatch(new GetWorkflows());

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetWorkflowsSucceed))
      .subscribe((workflows) => {
        if (this.isJobOrderWorkflowTabActive) {
          this.workflowsWithDetails = workflows.payload;
          this.customStepOrderFormGroup.reset();
          this.customStepApplicationFormGroup.reset();

          if (this.selectedCard) {
            const index = this.workflowsWithDetails.findIndex(w => w.id === this.selectedCard?.id);
            this.onCardSelected(this.workflowsWithDetails[index]);
          } else {
            this.onCardSelected(this.workflowsWithDetails[0]);
          }
        }
      });
  }

  override ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onTabSelected(selectedTab: any): void {
    this.isJobOrderWorkflowTabActive = WorkflowNavigationTabs['JobOrderWorkflow'] === selectedTab.selectedIndex;
    this.isWorkflowMappingTabActive = WorkflowNavigationTabs['WorkflowMapping'] === selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));

    if (this.isJobOrderWorkflowTabActive) {
      this.store.dispatch(new GetWorkflows());
    }

    // triggers refresh grid and other data if tab changed
    if (this.isWorkflowMappingTabActive) {
      this.store.dispatch(new GetAssignedSkillsByOrganization());
      this.store.dispatch(new GetWorkflowMappingPages());
      this.store.dispatch(new GetRolesForWorkflowMapping());
      this.store.dispatch(new GetUsersForWorkflowMapping());
      this.store.dispatch(new GetWorkflows());
    }
  }

  public onAddNewWorkflowClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onCardSelected(card: WorkflowWithDetails): void {
    if (card && card.workflows && card.workflows.length > 0) {
      this.workflowsWithDetails.forEach(card => card.isActive = false);

      card.isActive = true;
      this.selectedCard = card;
      this.orderWorkflow = card.workflows[0];
      this.applicationWorkflow = card.workflows[1];

      setTimeout(() => {
        this.customOrderSteps$.next(this.orderWorkflow.steps);
        this.customApplicationSteps$.next(this.applicationWorkflow.steps);
      }, 300)
    }
  }

  public onCustomStepRemoveClick(): void {
    this.onUpdateWorkflowStepsClick(true);
  }

  public onCancelFormClick(): void {
    if (this.workflowFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
          filter(confirm => !!confirm),
          take(1)
        ).subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.workflowFormGroup.reset();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.workflowFormGroup.reset();
    }
  }

  public onCreateWorkflowClick(): void {
    if (this.workflowFormGroup.valid){
      const  workflowWithDetails: WorkflowWithDetails = {
        name: this.workflowFormGroup.controls['workflow'].value,
        type: WorkflowGroupType.Organization
      }

      this.store.dispatch(new SaveWorkflow(workflowWithDetails));
      this.store.dispatch(new ShowSideDialog(false));
      this.workflowFormGroup.reset();
    } else {
      this.workflowFormGroup.markAllAsTouched();
    }
  }

  public onDeleteWorkflowClick(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      }).pipe(
        take(1)
      ).subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveWorkflow(this.selectedCard as WorkflowWithDetails));
        }
      });
  }

  public onUpdateWorkflowStepsClick(isRemoveStep: boolean = false): void {
    if (this.customStepOrderFormGroup.valid && this.customStepApplicationFormGroup.valid) {
      let orderSteps: Step[] = [];
      let applicationSteps: Step[] = [];

      if (this.orderWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).length > 0) {
        // map Order workflow custom steps
        this.orderWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).forEach((customStep, i) => {
          customStep.name = this.customStepOrderFormGroup.controls['customStepName'].value[i];
          customStep.status = this.customStepOrderFormGroup.controls['customStepStatus'].value[i];
          customStep.order = i + 1;
        });

        orderSteps = this.orderWorkflow.steps;
      }

      if (this.applicationWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).length > 0) {
        // map Application workflow custom steps
        this.applicationWorkflow.steps.filter(s => s.type === WorkflowStepType.Custom).forEach((customStep, i) => {
          customStep.name = this.customStepApplicationFormGroup.controls['customStepName'].value[i];
          customStep.status = this.customStepApplicationFormGroup.controls['customStepStatus'].value[i];
          customStep.order = i + 2;
        });

        applicationSteps = this.applicationWorkflow.steps;
      }

      const workflowWithDetailsPut: WorkflowWithDetailsPut = {
        id: (this.selectedCard as WorkflowWithDetails).id ,
        name: (this.selectedCard as WorkflowWithDetails).name,
        customSteps: orderSteps.concat(applicationSteps)
      }

      this.store.dispatch(new UpdateWorkflow(workflowWithDetailsPut, isRemoveStep));
    } else {
      this.customStepOrderFormGroup.markAllAsTouched();
      this.customStepApplicationFormGroup.markAllAsTouched();
    }
  }

  public createCustomOrderStepFormGroup(): void {
    this.customStepOrderFormGroup = this.formBuilder.group({
      customParentStatus: this.formBuilder.array([]),
      customStepStatus: this.formBuilder.array([]),
      customStepName: this.formBuilder.array([])
    });
  }

  public createCustomApplicationStepFormGroup(): void {
    this.customStepApplicationFormGroup = this.formBuilder.group({
      customParentStatus: this.formBuilder.array([]),
      customStepStatus: this.formBuilder.array([]),
      customStepName: this.formBuilder.array([])
    });
  }

  private createWorkflowFormGroup(): void {
    this.workflowFormGroup = this.formBuilder.group({
      workflow: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }
}
