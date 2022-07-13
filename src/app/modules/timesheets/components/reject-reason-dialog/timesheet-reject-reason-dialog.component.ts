import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { rejectReasonMaxLength } from '../../constants';

@Component({
  selector: 'app-timesheet-reject-reason-dialog',
  templateUrl: './timesheet-reject-reason-dialog.component.html',
  styleUrls: ['./timesheet-reject-reason-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetRejectReasonDialogComponent {
  @Input()
  public container: HTMLElement | null = null;

  @Input()
  public visible: boolean = false;

  @Output()
  public readonly visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public readonly rejectReasonChange: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('rejectReasonDialog')
  public rejectReasonDialog: DialogComponent;

  public readonly form: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(rejectReasonMaxLength)]],
  });

  public get reasonControl(): FormControl {
    return this.form?.get('reason') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
  ) {
  }

  public onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  public submit(): void {
    if (this.form.valid) {
      this.rejectReasonChange.emit(this.reasonControl.value);
      this.onVisibleChange(false);
    }
  }
}
