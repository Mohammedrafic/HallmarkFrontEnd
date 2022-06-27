import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'app-reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
  styleUrls: ['./reject-reason-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectReasonDialogComponent {
  @Input()
  public container: HTMLElement | null = null;

  @Input()
  public visible: boolean = false;

  @ViewChild('rejectReasonDialog')
  public rejectReasonDialog: DialogComponent;

  public readonly form: FormGroup = new FormGroup({
    reason: new FormControl(''),
  });

  @Output()
  public readonly visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public readonly rejectReasonChange: EventEmitter<string> = new EventEmitter<string>();

  public onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  public submit(): void {
    this.rejectReasonChange.emit(
      this.form.get('reason')?.value
    );
  }
}
