import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { rejectReasonMaxLength } from '../../../modules/timesheets/constants';

@Component({
  selector: 'app-reject-reason-input-dialog',
  templateUrl: './reject-reason-input-dialog.component.html',
  styleUrls: ['./reject-reason-input-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectReasonInputDialogComponent {
  @Input()
  public container: HTMLElement | null = null;

  @Input()
  public visible: boolean = false;

  @Output()
  public readonly visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public readonly rejectReasonChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public readonly dialogClose: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('rejectReasonDialog')
  public rejectReasonDialog: DialogComponent;

  public readonly form: FormGroup;

  public get reasonControl(): FormControl {
    return this.form?.get('reason') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(rejectReasonMaxLength)]],
    });
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

  public show(): void {
    this.rejectReasonDialog?.show();
  }

  public hide(): void {
    this.rejectReasonDialog?.hide();
  }

  public handleDialogClose(): void {
    this.form.reset();
    this.form.markAsPristine();

    this.dialogClose.emit();
  }
}
