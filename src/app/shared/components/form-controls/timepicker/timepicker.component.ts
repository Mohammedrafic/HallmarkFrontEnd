import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { FormatObject } from '@syncfusion/ej2-calendars/src/datepicker/datepicker';
import { MaskPlaceholderModel } from '@syncfusion/ej2-calendars/src/common/maskplaceholder-model';

@Component({
  selector: 'app-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => TimepickerComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimepickerComponent), multi: true },
  ],
})
export class TimepickerComponent extends BaseFormControlDirective {
  @Input() public format: string | FormatObject;
  @Input() public enableMask: boolean;
  @Input() public maskPlaceholder: MaskPlaceholderModel;
}
