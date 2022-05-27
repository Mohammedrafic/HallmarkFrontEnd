import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Step, Workflow } from '@shared/models/workflow.model';

@Component({
  selector: 'app-workflow-steps',
  templateUrl: './workflow-steps.component.html',
  styleUrls: ['./workflow-steps.component.scss']
})
export class WorkflowStepsComponent implements OnInit {
  @Input() workflow: Workflow;
  @Input() customSteps: Step[];
  @Input() customStepFormGroup: FormGroup
  @Output() customStepAddClick = new EventEmitter;
  @Output() customStepRemoveClick = new EventEmitter;

  get customStepStatus() {
    return this.customStepFormGroup.get('customStepStatus') as FormArray;
  }

  get customStepName() {
    return this.customStepFormGroup.get('customStepName') as FormArray;
  }

  private formBuilder: FormBuilder;

  constructor(@Inject(FormBuilder) private builder: FormBuilder) {
    this.formBuilder = builder;
  }

  ngOnInit(): void {
    if (this.customSteps.length > 0) {
      this.customSteps.map((item, i) => {
        if (i !== 0) {
          this.customStepName.push(this.formBuilder.control(item.name, [Validators.required, Validators.maxLength(50)]));
          this.customStepStatus.push(this.formBuilder.control(item.status, [Validators.required, Validators.maxLength(50)]));
        }
      });
    }
  }

  public onAddCustomStepClick(): void {
    this.customStepName.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
    this.customStepStatus.push(this.formBuilder.control('', [Validators.required, Validators.maxLength(50)]));
    this.customStepAddClick.emit(this.workflow.type);
  }

  public onRemoveCustomStepButtonClick(index: number): void {
    this.customStepRemoveClick.emit({ type: this.workflow.type, index: index + 1 });
  }
}
