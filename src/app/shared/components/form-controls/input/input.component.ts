import { Component, Input } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent extends BaseFormControlDirective {
  @Input() public maxlength: number;
  @Input() public override placeholder: string = '';
}
