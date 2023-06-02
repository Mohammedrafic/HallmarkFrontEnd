import { ChangeEventArgs } from '@syncfusion/ej2-angular-inputs';

import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-numeric-textbox',
  templateUrl: './numeric-textbox.component.html',
  styleUrls: ['./numeric-textbox.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NumericTextboxComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumericTextboxComponent), multi: true },
  ],
})
export class NumericTextboxComponent extends BaseFormControlDirective {
  @Input() public min: number;
  @Input() public max?: number;
  @Input() public format: string;
  @Input() public strictMode: boolean;
  @Input() public fieldValue: number | null;
  @Input() public htmlAttributes: { [key: string]: string };
  @Input() public decimals: number | null = 0;
  @Input() public maxLength: number;

  @Output() public changeValueEmitter: EventEmitter<number> = new EventEmitter();

  public handleChangeEvent(event: ChangeEventArgs): void {
    this.changeValueEmitter.emit(event.value);
  }
}
