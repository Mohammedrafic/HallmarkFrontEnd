import { ChangeEventArgs } from '@syncfusion/ej2-angular-inputs';

import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';

@Component({
  selector: 'app-numeric-textbox',
  templateUrl: './numeric-textbox.component.html',
  styleUrls: ['./numeric-textbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericTextboxComponent extends BaseFormControlDirective {
  @Input() public min: number;
  @Input() public max: number;

  @Output() public changeValueEmitter: EventEmitter<number> = new EventEmitter();

  public handleChangeEvent(event: ChangeEventArgs): void {
    this.changeValueEmitter.emit(event.value);
  }
}
