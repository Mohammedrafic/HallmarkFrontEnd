import { Directive, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Directive()
export class BaseFormControlDirective extends DestroyableDirective {
  @Input() public controlName: string;
  @Input() public formGroupInstance: FormGroup;
  @Input() public id: string;
  @Input() public label: string;
  @Input() public tabindex: number = 0;
  @Input() public placeholder: string;
}
