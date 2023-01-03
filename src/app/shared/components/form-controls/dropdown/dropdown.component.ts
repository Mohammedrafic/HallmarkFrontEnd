import { Component, forwardRef, Input } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DropdownComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DropdownComponent), multi: true },
  ],
})
export class DropdownComponent extends BaseFormControlDirective {
  @Input() public dataSource: unknown | null | undefined;
  @Input() public fields: FieldSettingsModel;
  @Input() public hideBorder = true;
}
