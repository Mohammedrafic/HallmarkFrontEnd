import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowSideDialog } from '../../../store/app.actions';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { GetWorkflows, GetWorkflowsSucceed, RemoveWorkflow, SaveWorkflow, UpdateWorkflow } from '../../store/workflow.actions';
import { Step, Workflow, WorkflowWithDetails, WorkflowWithDetailsPut } from '@shared/models/workflow.model';
import { ActivatedRoute } from '@angular/router';
import { UserState } from '../../../store/user.state';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import { WorkflowType } from '@shared/enums/workflow-type';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';

@Component({
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
  styleUrls: ['./job-order.component.scss']
})
export class JobOrderComponent implements OnInit, OnDestroy {
  @Input() isActive: boolean = false;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public workflowsWithDetails: WorkflowWithDetails[] = [];
  public workflowFormGroup: FormGroup;
  public customStepOrderFormGroup: FormGroup;
  public customStepApplicationFormGroup: FormGroup;
  public currentBusinessUnitId: number | null = null;

  public selectedCard: WorkflowWithDetails;
  public orderWorkflow: Workflow;
  public applicationWorkflow: Workflow;

  public customOrderSteps: Step[] = [];
  public customApplicationSteps: Step[] = [];

  private formBuilder: FormBuilder;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private actions$: Actions,
              private store: Store,
              private route: ActivatedRoute,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    this.formBuilder = builder;
    this.createCustomStepFormGroup();
    this.createWorkflowFormGroup();
  }

  ngOnInit(): void {
    this.organizationId$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe(id => {
      this.currentBusinessUnitId = id;
      this.store.dispatch(new GetWorkflows(this.currentBusinessUnitId));
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetWorkflowsSucceed))
      .subscribe((workflows) => {
        this.workflowsWithDetails = workflows.payload;
        this.onCardSelected(this.workflowsWithDetails[0]);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onAddNewWorkflowClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onCardSelected(card: WorkflowWithDetails): void {
    if (card && card.workflows && card.workflows.length > 0) {
      this.customOrderSteps = [];
      this.customApplicationSteps = [];
      this.customStepOrderFormGroup.reset();
      this.workflowsWithDetails.forEach(card => card.isActive = false);
      card.isActive = true;
      this.selectedCard = card;
      this.orderWorkflow = card.workflows[0];
      this.applicationWorkflow = card.workflows[1];
    }
  }

  public onCustomStepClick(workFlowType: WorkflowType): void {
    if (workFlowType === WorkflowType.OrderWorkflow) {
      // add element to override parent status
      if (this.customOrderSteps.length === 0) {
        this.customOrderSteps.push({
          id: this.orderWorkflow.steps[0].id,
          name: this.orderWorkflow.steps[0].name,
          status: '',
          type: this.orderWorkflow.steps[0].type,
          order: this.orderWorkflow.steps[0].order,
          workflowId: this.orderWorkflow.steps[0].workflowId
        });
      }

      let newCustomStep: Step = {
        name: '',
        status: '',
        type: WorkflowStepType.Custom,
        workflowId: this.orderWorkflow.steps[0].workflowId
      }
      this.customOrderSteps.push(newCustomStep);
    } else {
      if (this.customApplicationSteps.length === 0) {
        // add element to override parent status
        this.customApplicationSteps.push({
          id: this.applicationWorkflow.steps[0].id,
          name: this.applicationWorkflow.steps[0].name,
          status: '',
          type: this.applicationWorkflow.steps[0].type,
          order: this.applicationWorkflow.steps[0].order,
          workflowId: this.applicationWorkflow.steps[0].workflowId
        });
      }

      let newCustomStep: Step = {
        name: '',
        status: '',
        type: WorkflowStepType.Custom,
        workflowId: this.applicationWorkflow.steps[0].workflowId
      }
      this.customApplicationSteps.push(newCustomStep);
    }
  }

  public onCustomStepRemoveClick(stepDetails: any): void {
    if (stepDetails.type === WorkflowType.OrderWorkflow) {
      this.customOrderSteps.splice(stepDetails.index, 1);
      if (this.customOrderSteps.length === 1) {
        this.customOrderSteps = [];
      }
    } else {
      this.customApplicationSteps.splice(stepDetails.index, 1);
      if (this.customApplicationSteps.length === 1) {
        this.customApplicationSteps = [];
      }
    }
  }

  public onCancelFormClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.workflowFormGroup.reset();
      });
  }

  public onSaveFormClick(): void {
    if (this.workflowFormGroup.valid){
      const  workflowWithDetails: WorkflowWithDetails = {
        name: this.workflowFormGroup.controls['workflow'].value,
        type: WorkflowGroupType.Organization,
        businessUnitId: this.currentBusinessUnitId
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
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveWorkflow(this.selectedCard));
        }
      });
  }

  public onUpdateWorkflowClick(): void {
    if ((this.customStepOrderFormGroup.valid && this.customOrderSteps.length > 0)
      || (this.customStepApplicationFormGroup.valid && this.customApplicationSteps.length > 0)) {

      if (this.customOrderSteps.length > 0) {
        // map Order workflow custom steps and override parent status
        this.customOrderSteps[0].status = this.customStepOrderFormGroup.controls['customParentStatus'].value;
        this.customOrderSteps.forEach((step, i) => {
          if (i !== 0) {
            step.name = this.customStepOrderFormGroup.controls['customStepName'].value[i - 1];
            step.status = this.customStepOrderFormGroup.controls['customStepStatus'].value[i - 1];
            step.order = i;
          }
        });
      }

      if (this.customApplicationSteps.length > 0) {
        // map Application workflow custom steps and override parent status
        this.customApplicationSteps[0].status = this.customStepApplicationFormGroup.controls['customParentStatus'].value;
        this.customApplicationSteps.forEach((step, i) => {
          if (i !== 0) {
            step.name = this.customStepApplicationFormGroup.controls['customStepName'].value[i - 1];
            step.status = this.customStepApplicationFormGroup.controls['customStepStatus'].value[i - 1];
            step.order = i;
          }
        });
      }

      const workflowWithDetailsPut: WorkflowWithDetailsPut = {
        id: this.selectedCard.id,
        name: this.selectedCard.name,
        customSteps: this.customOrderSteps.concat(this.customApplicationSteps)
      }

      console.log(workflowWithDetailsPut); // TODO: remove after BE fix
      // this.store.dispatch(new UpdateWorkflow(workflowWithDetailsPut, this.selectedCard.businessUnitId)); //TODO: uncomment BE after fix
      this.customStepOrderFormGroup.reset();
      this.customStepApplicationFormGroup.reset();
    } else {
      this.customStepOrderFormGroup.markAllAsTouched();
      this.customStepApplicationFormGroup.markAllAsTouched();
    }
  }

  public createCustomStepFormGroup(): void {
    this.customStepOrderFormGroup = this.formBuilder.group({
      customParentStatus: ['', [Validators.required, Validators.maxLength(50)]],
      customStepStatus: this.formBuilder.array([]),
      customStepName: this.formBuilder.array([])
    });

    this.customStepApplicationFormGroup = this.formBuilder.group({
      customParentStatus: ['', [Validators.required, Validators.maxLength(50)]],
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
