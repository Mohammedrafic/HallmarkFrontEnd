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
  public customStepFormGroup: FormGroup;
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
      this.workflowsWithDetails.forEach(card => card.isActive = false);
      card.isActive = true;
      this.selectedCard = card;
      this.orderWorkflow = card.workflows[0];
      this.applicationWorkflow = card.workflows[1];
      this.customStepFormGroup.reset();
    }
  }

  public onCustomStepClick(workFlowType: WorkflowType): void {
    if (workFlowType === WorkflowType.OrderWorkflow) {
      let newCustomStep: Step = {
        name: '',
        status: '',
        type: WorkflowType.OrderWorkflow,
        workflowId: this.selectedCard.id
      }
      this.customOrderSteps.push(newCustomStep);
    } else {
      let newCustomStep: Step = {
        name: '',
        status: '',
        type: WorkflowType.ApplicationWorkflow,
        workflowId: this.selectedCard.id
      }
      this.customApplicationSteps.push(newCustomStep);
    }
  }

  public onCustomStepRemoveClick(stepDetails: any): void {
    if (stepDetails.type === WorkflowType.OrderWorkflow) {
      this.customOrderSteps.splice(stepDetails.index, 1);
    } else {
      this.customApplicationSteps.splice(stepDetails.index, 1);
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
    if (this.customStepFormGroup.valid){
      const workflowWithDetailsPut: WorkflowWithDetailsPut = {
        id: this.selectedCard.id,
        name: this.selectedCard.name,
        customSteps: this.customOrderSteps.concat(this.customApplicationSteps)
      }
      console.log(workflowWithDetailsPut); // TODO: remove after implementation
      // this.store.dispatch(new UpdateWorkflow(workflowWithDetailsPut, this.selectedCard.businessUnitId)); //TODO: uncomment after implementation
    } else {
      this.customStepFormGroup.markAllAsTouched();
    }
  }

  public createCustomStepFormGroup(): void {
    this.customStepFormGroup = this.formBuilder.group({
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
