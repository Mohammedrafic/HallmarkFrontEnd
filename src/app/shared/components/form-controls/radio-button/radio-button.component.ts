import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ChangeArgs } from '@syncfusion/ej2-angular-buttons';

import { BaseFormControlDirective } from '../base-form-control.directive';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent extends BaseFormControlDirective {
  @Input('value') public radioValue: number;

  public onChange({ value }: ChangeArgs): void {
    this.getControl()?.setValue(value);
  }
}
