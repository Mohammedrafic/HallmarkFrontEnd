import { Component, EventEmitter, Inject, Input, OnInit, OnDestroy, Output, SimpleChange } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step, Workflow } from '@shared/models/workflow.model';
import { Subject, takeUntil } from 'rxjs';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { WorkflowType } from '@shared/enums/workflow-type';
import { filter } from 'rxjs/operators';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { RemoveWorkflowDeclined } from '../../../store/workflow.actions';

@Component({
  selector: 'app-workflow-steps',
  templateUrl: './workflow-steps.component.html',
  styleUrls: ['./workflow-steps.component.scss']
})
export class WorkflowStepsComponent implements OnInit, OnDestroy {
  @Input() workflow: Workflow;
  @Input() workflowSteps$: Subject<Step[]>;
  @Input() customStepFormGroup: FormGroup;

  @Output() customStepAddClick = new EventEmitter;
  @Output() customStepRemoveClick = new EventEmitter;

  public initialSteps: Step[];
  public steps: Step[];
  public workflowTypeName = '';
  public incompleteShortlistedStepName: string;
  public publishedOfferedStepName: string;
  public publishedOfferedStepStatus: string;

  get customParentStatus() {
    return this.customStepFormGroup.get('customParentStatus') as FormArray;
  }

  get customStepStatus() {
    return this.customStepFormGroup.get('customStepStatus') as FormArray;
  }

  get customStepName() {
    return this.customStepFormGroup.get('customStepName') as FormArray;
  }

  private formBuilder: FormBuilder;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(@Inject(FormBuilder) private builder: FormBuilder,
              private actions$: Actions,
              private confirmService: ConfirmService) {
    this.formBuilder = builder;
  }

  ngOnInit(): void {
    this.setStepNameAndStatus(this.workflow);
    this.workflowSteps$.pipe(filter(Boolean),takeUntil(this.unsubscribe$)).subscribe((steps: Step[]) => {
      this.initialSteps = steps.slice(); // make a copy of steps to use them in case update will fail
      this.steps = steps;

      // remove steps that were added but not saved during workflows switching
      const emptyLeftOverStep = steps.find(s => s.status === '' && s.name === '');
      if (emptyLeftOverStep) {
        this.steps.splice(this.steps.indexOf(emptyLeftOverStep), 1);
      }

      this.customParentStatus.clear();
      this.customStepName.clear();
      this.customStepStatus.clear();

      if (this.steps.length > 2) {
        this.steps.forEach((item) => {
          if ((item.type === WorkflowStepType.Incomplete && this.customParentStatus.length === 0)
            || (item.type === WorkflowStepType.Shortlisted && this.customParentStatus.length === 0)) {
            this.customParentStatus.push(this.formBuilder.control(item.status, [Validators.required, Validators.maxLength(50)]));
          }

          if (item.type === WorkflowStepType.Custom) {
            this.customStepName.push(this.formBuilder.control(item.name, [Validators.required, Validators.maxLength(50)]));
            this.customStepStatus.push(this.formBuilder.control(item.status, [Validators.required, Validators.maxLength(50)]));
          }
        });
      }
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(RemoveWorkflowDeclined)).subscribe(() => {
      this.steps = this.initialSteps;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onAddCustomStepClick(): void {
    this.addParentStepStatus();
    this.addChildStepDetails();
  }

  public onRemoveCustomStepButtonClick(index: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.steps.splice(index, 1);

        if (this.steps.length === 2) {
          this.steps = []; // if no custom steps, overridden parent status also not need
        }

        this.customStepName.removeAt(index - 2);
        this.customStepStatus.removeAt(index - 2);
        if (this.customStepStatus.length === 0 && this.customStepStatus.length === 0) {
          this.customParentStatus.removeAt(0); // parent status is always the one, so its index = 0
        }

        this.customStepRemoveClick.emit();
      });
  }

  private addParentStepStatus(): void {
    if (this.steps.length === 2) {
      // add element to override parent status
      this.steps[0].status = '';
      this.customParentStatus.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
    }
  }

  private addChildStepDetails(): void {
    const newCustomStep: Step = {
      name: '',
      status: '',
      type: WorkflowStepType.Custom,
      workflowId: this.workflow.steps[0].workflowId
    }
    this.steps.push(newCustomStep);
    this.customStepName.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
    this.customStepStatus.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
  }

  private setStepNameAndStatus(workflow: Workflow): void {
    if (workflow.type === WorkflowType.OrderWorkflow) {
      this.workflowTypeName = 'Order Workflow';

      const incompleteStep = workflow.steps.find(step => step.type === WorkflowStepType.Incomplete);
      if (incompleteStep) {
        this.incompleteShortlistedStepName = incompleteStep.name;
      }

      const publishedStep = workflow.steps.find(step => step.type === WorkflowStepType.Published);
      if (publishedStep) {
        this.publishedOfferedStepName = publishedStep.name;
        this.publishedOfferedStepStatus = publishedStep.status;
      }
    } else {
      this.workflowTypeName = 'Application Workflow';
      const shortlistedStep = workflow.steps.find(step => step.type === WorkflowStepType.Shortlisted);
      if (shortlistedStep) {
        this.incompleteShortlistedStepName = shortlistedStep.name;
      }

      const offeredStep = workflow.steps.find(step => step.type === WorkflowStepType.Offered);
      if (offeredStep) {
        this.publishedOfferedStepName = offeredStep.name;
        this.publishedOfferedStepStatus = offeredStep.status;
      }
    }
  }
}
